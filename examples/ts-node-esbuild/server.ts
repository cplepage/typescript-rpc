import * as http from "http";
import {readFileSync} from "fs";
import createHandler from "typescript-rpc/createHandler";

const api = {
    hello(greeting: string){
        return greeting + " World";
    }
}

export default api;

const rpcHandler = createHandler(api);

http.createServer(async (req, res) => {
    await rpcHandler(req, res);

    if(res.headersSent) return;

    if(req?.url?.endsWith("client.js")){
        res.end(readFileSync("client.js"));
        return;
    }

    res.end("<div></div><script src='/client.js'></script>");
}).listen(8000);

console.log("Listenning at http://localhost:8000");

