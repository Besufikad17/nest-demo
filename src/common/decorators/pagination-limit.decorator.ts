import { SetMetadata } from "@nestjs/common";
import { PaginationPolicyOptions } from "src/common/rate-limit/interfaces/rate-limit-policy.interface";

export const PAGINATION_POLICY_KEY = "pagination_policy";

export const PaginationLimit = (policy: PaginationPolicyOptions) => SetMetadata(PAGINATION_POLICY_KEY, policy);
