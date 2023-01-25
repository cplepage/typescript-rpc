export type UserModel = {
    id: string,
    username: string,
    password: string,
    age?: number,
    interest?: string[]
}

export const users: Map<UserModel['id'], UserModel> = new Map();

export const activeTokens: Map<string, UserModel['id']> = new Map();
