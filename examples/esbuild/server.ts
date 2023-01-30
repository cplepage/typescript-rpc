import * as http from "http";
import {readFileSync} from "fs";
import createHandler from "typescript-rpc/createHandler";

class Api {
    hello(greeting: string){
        return greeting + " World";
    }
}

const api = new Api();

export default api;

const rpcHandler = createHandler(api);

const server = http.createServer(function(req, res) {
    const isSending = rpcHandler(req, res);

    if(isSending) return;

    if(req?.url?.endsWith("client.js")){
        res.end(readFileSync("client.js"));
        return;
    }

    res.end("<div></div><script src='/client.js'></script>");
});

server.listen(8000);

console.log("Listenning at http://localhost:8000");

