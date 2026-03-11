import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { parseUserAgent } from "../utils/strings.utils";

export const GetDeviceInfo = createParamDecorator(
  (data: any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    
    const userAgent = request.headers["device-info"] ? request.headers["device-info"] : 
      request.headers["DEVICE-INFO"] ? request.headers["DEVICE-INFO"] : 
        request.headers["Device-Info"] ? request.headers["Device-Info"] : null;

    return parseUserAgent(userAgent);
  }
);