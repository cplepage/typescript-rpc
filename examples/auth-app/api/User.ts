import {Authenticate, AuthenticatedRequest} from "./Login";
import {Middleware, Put} from "typescript-rpc/createHandler";
import {UserModel, users} from "./Data";

@Middleware(Authenticate)
export class User {

    get(this: AuthenticatedRequest<this>){
        const user = {...this.user};
        delete user.password;
        return user;
    }

    @Put()
    update(this: AuthenticatedRequest<this>, userData: Partial<UserModel>){
        users.set(this.user.id, {
            ...this.user,
            ...userData
        });
    }
}
