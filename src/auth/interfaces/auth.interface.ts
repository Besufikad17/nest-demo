export interface IUser {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    passwordHash: string;
}

export interface IAuthResponse {
    message: string;
    token?: string;
}

export interface IOTPResponse {
    message: string;
}
