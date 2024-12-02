export type IDate = {
    year: number,
    month: number,
    day: number
} 

export type IUser = {
    token: string,
    user: {
        username: string,
        email: string,
        password: string
    }
}