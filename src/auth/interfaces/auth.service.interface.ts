import { LoginDto, RecoverAccountDto, SignUpDto, UpdatePasswordDto } from "../dto/auth.dto";

export interface IAuthResponse {
    message: string;
    token?: string;
}

export abstract class IAuthService {
    abstract signUp(signUpDto: SignUpDto): Promise<IAuthResponse>;
    abstract login(loginDto: LoginDto): Promise<IAuthResponse>;
    abstract updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto): Promise<IAuthResponse>;
    abstract recoverAccount(recoverAccountDto: RecoverAccountDto): Promise<IAuthResponse>;
}
