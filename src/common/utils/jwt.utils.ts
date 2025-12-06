import { jwtDecode } from "jwt-decode";
import { JwtPayload } from "src/auth/interfaces/jwt.interface";

export function decodeToken(token: string): JwtPayload {
	return jwtDecode<JwtPayload>(token);
}
