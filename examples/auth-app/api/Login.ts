import {Middleware, Post} from "typescript-rpc/createHandler";
import {randomUUID} from "crypto";
import {activeTokens, users} from "./Data";
import {IncomingMessage} from "http";

export function Authenticate(this: IncomingMessage){
    const token = this.headers.authorization;

    if(!token)
        return Error("Unauthorized");

    const userId = activeTokens.get(token);

    if(!userId)
        return Error("Unauthorized");

    const user = users.get(userId);

    if(!user)
        return Error("Unauthorized");

    return {
        token,
        user
    }
}

export type AuthenticatedRequest<T> = T & Partial<Exclude<ReturnType<typeof Authenticate>, Error>>;

export default class Login {

    @Post()
    async register(username: string, password: string){
        const id = randomUUID();
        users.set(id, {
            id,
            username,
            password
        });
    }

    @Post()
    async login(username: string, password: string){
        for(const user of Array.from(users.values())){
            if(user.username !== username) continue;

            if(password !== user.password)
                return {code: 1, error: "Wrong password"};

            const token = randomUUID();
            activeTokens.set(token, user.id);
            return token;
        }
        return {code: 2, error: "Cannot find user"};
    }

    @Post()
    async verify(token: string){
        return activeTokens.get(token);
    }

    @Post()
    @Middleware(Authenticate)
    async logout(this: AuthenticatedRequest<this>){
        activeTokens.delete(this.token);
    }

}
