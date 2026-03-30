import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as client from "prom-client";
import { decodeToken } from "src/common/utils/jwt.utils";
import {
  RateLimitContext,
  RateLimitGroup,
  RateLimitPolicyOptions,
  RateLimitScope,
} from "src/common/rate-limit/interfaces/rate-limit-policy.interface";
import { RateLimitStore } from "src/common/rate-limit/rate-limit.store";

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);
  private readonly mode: "monitor" | "enforce";
  private readonly enabledGroups: Set<RateLimitGroup>;

  private readonly hitCounter = this.getOrCreateCounter(
    "ratelimit_hit_total",
    "Total number of rate limit breaches",
  );
  private readonly penaltyCounter = this.getOrCreateCounter(
    "ratelimit_penalty_applied_total",
    "Total number of progressive penalty blocks applied",
  );

  constructor(
    private readonly configService: ConfigService,
    private readonly store: RateLimitStore,
  ) {
    this.mode = (this.configService.get<string>("RATE_LIMIT_MODE")?.toLowerCase() === "enforce") ? "enforce" : "monitor";
    const enabledGroupConfig = this.configService.get<string>("RATE_LIMIT_ENABLED_GROUPS") || "public,sensitive,read";
    this.enabledGroups = new Set(
      enabledGroupConfig
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean) as RateLimitGroup[],
    );
  }

  isPolicyEnabled(policy: RateLimitPolicyOptions): boolean {
    return this.enabledGroups.has(policy.group);
  }

  isEnforceMode(): boolean {
    return this.mode === "enforce";
  }

  extractIp(request: any): string {
    const forwarded = request.headers["x-forwarded-for"];
    if (Array.isArray(forwarded) && forwarded.length > 0) {
      return forwarded[0].split(",")[0].trim();
    }

    if (typeof forwarded === "string" && forwarded.length > 0) {
      return forwarded.split(",")[0].trim();
    }

    return request.ip || request.socket?.remoteAddress || "unknown";
  }

  extractIdentity(request: any, identityFields?: string[]): string | undefined {
    const fallbackFields = ["email", "phoneNumber", "value", "userId"];
    const fields = (identityFields && identityFields.length > 0) ? identityFields : fallbackFields;

    for (const field of fields) {
      const bodyValue = request.body?.[field];
      if (typeof bodyValue === "string" && bodyValue.trim().length > 0) {
        return this.normalizeIdentity(field, bodyValue.trim());
      }
      if (typeof bodyValue === "number") {
        return this.normalizeIdentity(field, String(bodyValue));
      }

      const queryValue = request.query?.[field];
      if (typeof queryValue === "string" && queryValue.trim().length > 0) {
        return this.normalizeIdentity(field, queryValue.trim());
      }
    }

    return undefined;
  }

  extractUserId(request: any): string | undefined {
    if (request.user?.id) {
      return request.user.id;
    }

    const authHeader = request.headers?.authorization;
    if (!authHeader || typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
      return undefined;
    }

    const token = authHeader.split(" ")[1];
    try {
      const decoded = decodeToken(token);
      return decoded?.sub;
    } catch {
      return undefined;
    }
  }

  async ensureNotBlocked(policy: RateLimitPolicyOptions, tokens: Partial<Record<RateLimitScope, string>>): Promise<number> {
    let maxBlockTtl = 0;

    for (const [scope, token] of Object.entries(tokens) as Array<[RateLimitScope, string | undefined]>) {
      if (!token) {
        continue;
      }
      const blockKey = this.buildBlockKey(policy.id, scope, token);
      const blockValue = await this.store.get(blockKey);
      if (blockValue) {
        const ttl = await this.store.getTtl(blockKey);
        maxBlockTtl = Math.max(maxBlockTtl, ttl);
      }
    }

    return maxBlockTtl;
  }

  async evaluateRequestLimit(
    policy: RateLimitPolicyOptions,
    tokens: Partial<Record<RateLimitScope, string>>,
  ): Promise<{ exceeded: boolean; retryAfterSec: number; reason?: string }> {
    let retryAfterSec = 0;
    let exceeded = false;
    let reason: string | undefined;

    for (const rule of policy.limits) {
      const token = tokens[rule.scope];
      if (!token) {
        continue;
      }

      const key = this.buildRequestKey(policy.id, rule.scope, token, rule.windowSec);
      const value = await this.store.increment(key, rule.windowSec);

      if (value > rule.limit) {
        exceeded = true;
        const ttl = await this.store.getTtl(key);
        retryAfterSec = Math.max(retryAfterSec, ttl || rule.windowSec);
        reason = `${rule.scope}:${rule.limit}/${rule.windowSec}s`;
      }
    }

    if (exceeded) {
      this.hitCounter.inc({ policy: policy.id });
    }

    return { exceeded, retryAfterSec, reason };
  }

  async recordOutcome(context: RateLimitContext, success: boolean): Promise<void> {
    const { policy, tokens } = context;
    if (!policy.penalty) {
      return;
    }

    if (success) {
      await this.clearPenaltyCounters(policy, tokens);
      return;
    }

    for (const [scope, token] of Object.entries(tokens) as Array<[RateLimitScope, string | undefined]>) {
      if (!token) {
        continue;
      }
      const failKey = this.buildFailureKey(policy.id, scope, token, policy.penalty.failureWindowSec);
      const failures = await this.store.increment(failKey, policy.penalty.failureWindowSec);

      const matchingStep = [...policy.penalty.steps]
        .sort((a, b) => b.failures - a.failures)
        .find((step) => failures >= step.failures);

      if (!matchingStep) {
        continue;
      }

      const blockKey = this.buildBlockKey(policy.id, scope, token);
      const existingTtl = await this.store.getTtl(blockKey);
      if (existingTtl < matchingStep.blockSec) {
        await this.store.set(blockKey, 1, matchingStep.blockSec);
      }

      this.penaltyCounter.inc({ policy: policy.id });
      this.logger.warn(`Penalty block applied for policy=${policy.id}, scope=${scope}, blockSec=${matchingStep.blockSec}`);
    }
  }

  onLimitExceeded(policyId: string, details: string) {
    this.logger.warn(`Rate limit exceeded for policy=${policyId}, details=${details}`);
  }

  private async clearPenaltyCounters(policy: RateLimitPolicyOptions, tokens: Partial<Record<RateLimitScope, string>>) {
    for (const [scope, token] of Object.entries(tokens) as Array<[RateLimitScope, string | undefined]>) {
      if (!token) {
        continue;
      }
      const key = this.buildFailureKey(policy.id, scope, token, policy.penalty?.failureWindowSec || 0);
      await this.store.del(key);
    }
  }

  private normalizeIdentity(field: string, value: string): string {
    if (field.toLowerCase().includes("email")) {
      return value.toLowerCase();
    }
    return value;
  }

  private buildRequestKey(policyId: string, scope: RateLimitScope, token: string, windowSec: number): string {
    return `rl:req:${policyId}:${scope}:${token}:${windowSec}`;
  }

  private buildFailureKey(policyId: string, scope: RateLimitScope, token: string, windowSec = 0): string {
    return `rl:fail:${policyId}:${scope}:${token}:${windowSec}`;
  }

  private buildBlockKey(policyId: string, scope: RateLimitScope, token: string): string {
    return `rl:block:${policyId}:${scope}:${token}`;
  }

  private getOrCreateCounter(name: string, help: string): client.Counter<string> {
    const existing = client.register.getSingleMetric(name);
    if (existing) {
      return existing as client.Counter<string>;
    }

    return new client.Counter({
      name,
      help,
      labelNames: ["policy"],
    });
  }
}
