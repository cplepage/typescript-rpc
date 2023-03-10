import Server from "fullstacked/server";
import createHandler from "typescript-rpc/createHandler";

const api = {
    hello(greeting: string){
        return greeting + " World";
    }
}
export default api;

Server.addListener(createHandler(api));

