export type RateLimitScope = "ip" | "identity" | "user";
export type RateLimitGroup = "public" | "sensitive" | "read";

export interface RateLimitRule {
  scope: RateLimitScope;
  limit: number;
  windowSec: number;
}

export interface PenaltyStep {
  failures: number;
  blockSec: number;
}

export interface ProgressivePenaltyOptions {
  failureWindowSec: number;
  steps: PenaltyStep[];
}

export interface RateLimitPolicyOptions {
  id: string;
  group: RateLimitGroup;
  limits: RateLimitRule[];
  identityFields?: string[];
  penalty?: ProgressivePenaltyOptions;
}

export interface RateLimitContext {
  policy: RateLimitPolicyOptions;
  tokens: Partial<Record<RateLimitScope, string>>;
}

export interface PaginationPolicyOptions {
  defaultTake: number;
  maxTake: number;
  maxSkip?: number;
}
