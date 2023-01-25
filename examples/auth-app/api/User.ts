import {Authenticate, AuthenticatedRequest} from "./Login";
import {Middleware, Put} from "typescript-rpc/createHandler";
import {UserModel, users} from "./Data";

@Middleware(Authenticate)
export class User {

    async get(this: AuthenticatedRequest<this>){
        const user = {...this.user};
        delete user.password;
        return user;
    }

    @Put()
    async update(this: AuthenticatedRequest<this>, userData: Partial<UserModel>){
        users.set(this.user.id, {
            ...this.user,
            ...userData
        });
    }
}
