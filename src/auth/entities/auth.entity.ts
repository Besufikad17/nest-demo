import { ApiProperty } from "@nestjs/swagger";
import { IAuthResponse } from "../interfaces";

export class AuthResponse implements IAuthResponse {
    @ApiProperty({ description: "JWT access token" })
    accessToken: string;

    @ApiProperty({ description: "JWT refresh token" })
    refreshToken: string;
}