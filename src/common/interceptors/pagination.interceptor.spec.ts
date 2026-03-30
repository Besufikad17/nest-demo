import { BadRequestException, CallHandler, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { of } from "rxjs";
import { PAGINATION_POLICY_KEY } from "../decorators/pagination-limit.decorator";
import { PaginationInterceptor } from "./pagination.interceptor";

describe("PaginationInterceptor", () => {
  let interceptor: PaginationInterceptor;

  beforeEach(() => {
    const reflector = new Reflector();
    interceptor = new PaginationInterceptor(reflector);
  });

  const makeExecutionContext = (query: any, withPolicy = true): ExecutionContext => {
    const request = { query } as any;

    const handler = () => undefined;
    if (withPolicy) {
      Reflect.defineMetadata(PAGINATION_POLICY_KEY, {
        defaultTake: 20,
        maxTake: 100,
        maxSkip: 10000,
      }, handler);
    }

    return {
      getHandler: () => handler,
      getClass: () => class Dummy { },
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  it("should set default pagination when query is empty", (done) => {
    const context = makeExecutionContext({});
    const next: CallHandler = { handle: () => of("ok") };

    interceptor.intercept(context, next).subscribe(() => {
      const req = context.switchToHttp().getRequest();
      expect(req.query.take).toBe(20);
      expect(req.query.skip).toBe(0);
      done();
    });
  });

  it("should throw for invalid take", () => {
    const context = makeExecutionContext({ take: "200" });
    const next: CallHandler = { handle: () => of("ok") };

    expect(() => interceptor.intercept(context, next)).toThrow(BadRequestException);
  });
});
