import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, catchError, from, map, mergeMap, throwError } from "rxjs";
import { RateLimitContext } from "src/common/rate-limit/interfaces/rate-limit-policy.interface";
import { RateLimitService } from "src/common/rate-limit/rate-limit.service";

@Injectable()
export class RateLimitOutcomeInterceptor implements NestInterceptor {
  constructor(private readonly rateLimitService: RateLimitService) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const rateLimitContext: RateLimitContext | undefined = request.__rateLimitContext;

    if (!rateLimitContext || !this.rateLimitService.isPolicyEnabled(rateLimitContext.policy)) {
      return next.handle();
    }

    return next.handle().pipe(
      mergeMap((response) => {
        const success = !(response && typeof response.success === "boolean" && response.success === false);
        return from(this.rateLimitService.recordOutcome(rateLimitContext, success)).pipe(
          map(() => response),
        );
      }),
      catchError((error) => from(this.rateLimitService.recordOutcome(rateLimitContext, false)).pipe(
        mergeMap(() => throwError(() => error)),
      )),
    );
  }
}
