import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import IORedis from "ioredis";

type MemoryEntry = {
  value: number;
  expiresAt: number;
};

@Injectable()
export class RateLimitStore implements OnModuleDestroy {
  private readonly logger = new Logger(RateLimitStore.name);
  private readonly memory = new Map<string, MemoryEntry>();
  private redis?: IORedis;
  private useMemory = true;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>("REDIS_HOST");
    const port = this.configService.get<number>("REDIS_PORT");
    const password = this.configService.get<string>("REDIS_PASSWORD");

    if (!host || !port) {
      this.logger.warn("Rate limit store falling back to in-memory storage (missing redis config)");
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

      this.redis.on("error", (error) => {
        this.useMemory = true;
        this.logger.warn(`Redis unavailable for rate-limit store; using memory fallback: ${error.message}`);
      });

      this.redis.connect()
        .then(() => {
          this.useMemory = false;
          this.logger.log("Rate limit store connected to redis");
        })
        .catch((error: Error) => {
          this.useMemory = true;
          this.logger.warn(`Failed to connect redis for rate-limit store; using memory fallback: ${error.message}`);
        });
    } catch (error) {
      this.useMemory = true;
      this.logger.warn("Failed to initialize redis for rate-limit store; using memory fallback");
    }
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
    }
  }

  async increment(key: string, windowSec: number): Promise<number> {
    if (!this.useMemory && this.redis) {
      const value = await this.redis.incr(key);
      if (value === 1) {
        await this.redis.expire(key, windowSec);
      }
      return value;
    }

    return this.incrementMemory(key, windowSec);
  }

  async get(key: string): Promise<number | null> {
    if (!this.useMemory && this.redis) {
      const value = await this.redis.get(key);
      return value === null ? null : Number(value);
    }

    return this.getMemory(key);
  }

  async set(key: string, value: number, ttlSec: number): Promise<void> {
    if (!this.useMemory && this.redis) {
      await this.redis.set(key, String(value), "EX", ttlSec);
      return;
    }

    this.memory.set(key, {
      value,
      expiresAt: Date.now() + ttlSec * 1000,
    });
  }

  async getTtl(key: string): Promise<number> {
    if (!this.useMemory && this.redis) {
      const ttl = await this.redis.ttl(key);
      return ttl > 0 ? ttl : 0;
    }

    const entry = this.memory.get(key);
    if (!entry) {
      return 0;
    }
    if (entry.expiresAt <= Date.now()) {
      this.memory.delete(key);
      return 0;
    }

    return Math.max(Math.ceil((entry.expiresAt - Date.now()) / 1000), 0);
  }

  async del(key: string): Promise<void> {
    if (!this.useMemory && this.redis) {
      await this.redis.del(key);
      return;
    }

    this.memory.delete(key);
  }

  private incrementMemory(key: string, windowSec: number): number {
    const now = Date.now();
    const current = this.memory.get(key);

    if (!current || current.expiresAt <= now) {
      this.memory.set(key, {
        value: 1,
        expiresAt: now + windowSec * 1000,
      });
      return 1;
    }

    const next = current.value + 1;
    this.memory.set(key, {
      value: next,
      expiresAt: current.expiresAt,
    });
    return next;
  }

  private getMemory(key: string): number | null {
    const current = this.memory.get(key);
    if (!current) {
      return null;
    }

    if (current.expiresAt <= Date.now()) {
      this.memory.delete(key);
      return null;
    }

    return current.value;
  }
}
