import { jwtDecode } from "jwt-decode";
import { JwtPayload } from "src/common/interfaces";

export function decodeToken(token: string): JwtPayload {
	return jwtDecode<JwtPayload>(token);
}
