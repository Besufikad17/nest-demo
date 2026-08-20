import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import IORedis from "ioredis";

/** TTL for a pending WebAuthn challenge (5 minutes). */
const CHALLENGE_TTL_SEC = 300;

@Injectable()
export class WebAuthnChallengeService implements OnModuleDestroy {
  private readonly logger = new Logger(WebAuthnChallengeService.name);
  private redis?: IORedis;
  private useMemory = true;

  /** In-memory fallback: Map<key, { challenge, expiresAt }> */
  private readonly memory = new Map<string, { challenge: string; expiresAt: number }>();

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>("REDIS_HOST");
    const port = this.configService.get<number>("REDIS_PORT");
    const password = this.configService.get<string>("REDIS_PASSWORD");

    if (!host || !port) {
      this.logger.warn("WebAuthn challenge store falling back to in-memory (missing Redis config)");
      return;
    }

    try {
      this.redis = new IORedis({
        host,
        port,
        password,
        lazyConnect: true,
        maxRetriesPerRequest: 2,
      });

      this.redis.on("error", (err) => {
        this.useMemory = true;
        this.logger.warn(`Redis unavailable for WebAuthn challenges; using memory fallback: ${err.message}`);
      });

      this.redis
        .connect()
        .then(() => {
          this.useMemory = false;
          this.logger.log("WebAuthn challenge store connected to Redis");
        })
        .catch((err: Error) => {
          this.useMemory = true;
          this.logger.warn(`Failed to connect Redis for WebAuthn challenges; using memory fallback: ${err.message}`);
        });
    } catch (err) {
      console.error(err);
      this.useMemory = true;
      this.logger.warn("Failed to initialize Redis for WebAuthn challenges; using memory fallback");
    }
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
    }
  }

  // ─── Registration challenges ──────────────────────────────────────────────

  async setRegistrationChallenge(userId: string, challenge: string): Promise<void> {
    const key = this.regKey(userId);
    await this.setChallenge(key, challenge);
  }

  async getAndDeleteRegistrationChallenge(userId: string): Promise<string | null> {
    return this.getAndDeleteChallenge(this.regKey(userId));
  }

  // ─── Authentication challenges ────────────────────────────────────────────

  async setAuthenticationChallenge(userId: string, challenge: string): Promise<void> {
    const key = this.authKey(userId);
    await this.setChallenge(key, challenge);
  }

  async getAndDeleteAuthenticationChallenge(userId: string): Promise<string | null> {
    return this.getAndDeleteChallenge(this.authKey(userId));
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private regKey(userId: string): string {
    return `webauthn:reg:${userId}`;
  }

  private authKey(userId: string): string {
    return `webauthn:auth:${userId}`;
  }

  private async setChallenge(key: string, challenge: string): Promise<void> {
    if (!this.useMemory && this.redis) {
      await this.redis.set(key, challenge, "EX", CHALLENGE_TTL_SEC);
      return;
    }
    this.memory.set(key, {
      challenge,
      expiresAt: Date.now() + CHALLENGE_TTL_SEC * 1000,
    });
  }

  private async getAndDeleteChallenge(key: string): Promise<string | null> {
    if (!this.useMemory && this.redis) {
      // Atomic get-and-delete using a pipeline
      const pipeline = this.redis.pipeline();
      pipeline.get(key);
      pipeline.del(key);
      const results = await pipeline.exec();
      const value = results?.[0]?.[1] as string | null;
      return value ?? null;
    }

    const entry = this.memory.get(key);
    if (!entry) return null;
    this.memory.delete(key);
    if (entry.expiresAt <= Date.now()) return null;
    return entry.challenge;
  }
}
