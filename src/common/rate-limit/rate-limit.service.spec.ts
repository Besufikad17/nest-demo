import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { RateLimitPolicyOptions } from "./interfaces/rate-limit-policy.interface";
import { RateLimitService } from "./rate-limit.service";
import { RateLimitStore } from "./rate-limit.store";

describe("RateLimitService", () => {
  let service: RateLimitService;

  const basePolicy: RateLimitPolicyOptions = {
    id: "auth_login_test",
    group: "public",
    limits: [{ scope: "ip", limit: 5, windowSec: 60 }],
    penalty: {
      failureWindowSec: 600,
      steps: [
        { failures: 5, blockSec: 300 },
      ],
    },
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimitStore,
        RateLimitService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              const config: Record<string, any> = {
                RATE_LIMIT_MODE: "enforce",
                RATE_LIMIT_ENABLED_GROUPS: "public,sensitive,read",
              };
              return config[key];
            },
          },
        },
      ],
    }).compile();

    service = moduleRef.get(RateLimitService);
  });

  it("should exceed request limit after threshold", async () => {
    const token = { ip: "127.0.0.1" };

    for (let i = 0; i < 5; i++) {
      const result = await service.evaluateRequestLimit(basePolicy, token);
      expect(result.exceeded).toBe(false);
    }

    const exceededResult = await service.evaluateRequestLimit(basePolicy, token);
    expect(exceededResult.exceeded).toBe(true);
    expect(exceededResult.retryAfterSec).toBeGreaterThan(0);
  });

  it("should apply penalty block on repeated failures", async () => {
    const context = {
      policy: basePolicy,
      tokens: { ip: "10.1.1.1" },
    };

    for (let i = 0; i < 5; i++) {
      await service.recordOutcome(context, false);
    }

    const blockTtl = await service.ensureNotBlocked(basePolicy, context.tokens);
    expect(blockTtl).toBeGreaterThan(0);
  });

  it("should reset failure counters on success", async () => {
    const context = {
      policy: basePolicy,
      tokens: { identity: "test@example.com" },
    };

    for (let i = 0; i < 4; i++) {
      await service.recordOutcome(context, false);
    }

    await service.recordOutcome(context, true);
    await service.recordOutcome(context, false);

    const blockTtl = await service.ensureNotBlocked(basePolicy, context.tokens);
    expect(blockTtl).toBe(0);
  });
});
