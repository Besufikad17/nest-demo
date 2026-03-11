import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";

@Injectable()
export class DeviceInfoGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();

        if(!request.headers["device-info"] && !request.headers["DEVICE-INFO"] && !request.headers["Device-Info"]) {
            throw new ForbiddenException("Access denied: no device info found in headers");
        }

        return true;
    }
}