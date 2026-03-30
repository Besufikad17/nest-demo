import { SetMetadata } from "@nestjs/common";
import { RateLimitPolicyOptions } from "src/common/rate-limit/interfaces/rate-limit-policy.interface";

export const RATE_LIMIT_POLICY_KEY = "rate_limit_policy";

export const RateLimitPolicy = (policy: RateLimitPolicyOptions) => SetMetadata(RATE_LIMIT_POLICY_KEY, policy);
