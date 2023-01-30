import {Middleware, Post} from "typescript-rpc/createHandler";
import {randomUUID} from "crypto";
import {activeTokens, users} from "./Data";
import {IncomingMessage} from "http";

export function Authenticate(this: IncomingMessage){
    const token = this.headers.authorization;

    if(!token)
        throw Error("Unauthorized");

    const userId = activeTokens.get(token);

    if(!userId)
        throw Error("Unauthorized");

    const user = users.get(userId);

    if(!user)
        throw Error("Unauthorized");

    return {
        token,
        user
    }
}

export type AuthenticatedRequest<T> = T & Partial<ReturnType<typeof Authenticate>>;

export default class Login {

    @Post()
    register(username: string, password: string){
        const id = randomUUID();
        users.set(id, {
            id,
            username,
            password
        });
    }

    @Post()
    login(username: string, password: string){
        for(const user of Array.from(users.values())){
            if(user.username !== username) continue;

            if(password !== user.password)
                return {code: 1, error: "Wrong password"};

            const token = randomUUID();
            activeTokens.set(token, user.id);
            return {token};
        }
        return {code: 2, error: "Cannot find user"};
    }

    @Post()
    verify(token: string){
        const userId = activeTokens.get(token)
        return {userId};
    }

    @Post()
    @Middleware(Authenticate)
    logout(this: AuthenticatedRequest<this>){
        activeTokens.delete(this.token);
    }

}
