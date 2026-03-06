import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const GetClientIp = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest();

    const forwardedFor = req.headers["x-forwarded-for"];
    if (forwardedFor) {
      return forwardedFor.split(",")[0].trim();
    }

    return (
      req.headers["x-real-ip"] ||
      req.socket?.remoteAddress ||
      req.ip
    );
  },
);