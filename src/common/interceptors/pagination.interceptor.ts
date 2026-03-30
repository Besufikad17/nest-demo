import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { PAGINATION_POLICY_KEY } from "src/common/decorators/pagination-limit.decorator";
import { PaginationPolicyOptions } from "src/common/rate-limit/interfaces/rate-limit-policy.interface";

@Injectable()
export class PaginationInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const policy = this.reflector.getAllAndOverride<PaginationPolicyOptions>(
      PAGINATION_POLICY_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!policy) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const takeRaw = request.query?.take;
    const skipRaw = request.query?.skip;

    const take = this.parseQueryInt(takeRaw, "take", policy.defaultTake);
    const skip = this.parseQueryInt(skipRaw, "skip", 0);

    if (take <= 0) {
      throw new BadRequestException("take must be greater than 0");
    }
    if (take > policy.maxTake) {
      throw new BadRequestException(`take must not exceed ${policy.maxTake}`);
    }
    if (skip < 0) {
      throw new BadRequestException("skip must be greater than or equal to 0");
    }
    if (typeof policy.maxSkip === "number" && skip > policy.maxSkip) {
      throw new BadRequestException(`skip must not exceed ${policy.maxSkip}`);
    }

    request.query.take = take;
    request.query.skip = skip;

    return next.handle();
  }

  private parseQueryInt(value: unknown, field: string, fallback: number): number {
    if (value === undefined || value === null || value === "") {
      return fallback;
    }

    const num = Number(value);
    if (!Number.isFinite(num) || !Number.isInteger(num)) {
      throw new BadRequestException(`${field} must be an integer`);
    }

    return num;
  }
}
