export * from "./jwt.interface";
export * from "./user.interface";

export interface IApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: any;
}