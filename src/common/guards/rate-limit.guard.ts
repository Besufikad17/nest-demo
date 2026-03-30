import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RATE_LIMIT_POLICY_KEY } from "src/common/decorators/rate-limit-policy.decorator";
import { RateLimitContext, RateLimitPolicyOptions } from "src/common/rate-limit/interfaces/rate-limit-policy.interface";
import { RateLimitService } from "src/common/rate-limit/rate-limit.service";

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rateLimitService: RateLimitService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policy = this.reflector.getAllAndOverride<RateLimitPolicyOptions>(
      RATE_LIMIT_POLICY_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!policy || !this.rateLimitService.isPolicyEnabled(policy)) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const tokens = {
      ip: this.rateLimitService.extractIp(request),
      identity: this.rateLimitService.extractIdentity(request, policy.identityFields),
      user: this.rateLimitService.extractUserId(request),
    };

    const contextPayload: RateLimitContext = {
      policy,
      tokens,
    };
    request.__rateLimitContext = contextPayload;

    const blockTtl = await this.rateLimitService.ensureNotBlocked(policy, tokens);
    if (blockTtl > 0) {
      this.rateLimitService.onLimitExceeded(policy.id, `blocked:${blockTtl}s`);
      if (this.rateLimitService.isEnforceMode()) {
        throw new HttpException({
          message: `Too many failed attempts. Retry in ${blockTtl} seconds.`,
          retryAfter: blockTtl,
          code: "RATE_LIMIT_BLOCKED",
        }, HttpStatus.TOO_MANY_REQUESTS);
      }
      return true;
    }

    const evaluation = await this.rateLimitService.evaluateRequestLimit(policy, tokens);
    if (evaluation.exceeded) {
      this.rateLimitService.onLimitExceeded(policy.id, evaluation.reason || "request-limit");
      if (this.rateLimitService.isEnforceMode()) {
        throw new HttpException({
          message: `Rate limit exceeded. Retry in ${evaluation.retryAfterSec || 1} seconds.`,
          retryAfter: evaluation.retryAfterSec || 1,
          code: "RATE_LIMIT_EXCEEDED",
        }, HttpStatus.TOO_MANY_REQUESTS);
      }
    }

    return true;
  }
}
