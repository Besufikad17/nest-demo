export interface IUser {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    passwordHash: string;
}

export interface ISignUpResponse {
    message: string;
    token: string;
}

export interface ILoginResponse extends ISignUpResponse {}