import * as http from "http";
import {readFileSync} from "fs";
import createHandler, {Json, Numbers} from "typescript-rpc/createHandler";



class Api {
    @Numbers()
    add(a: number, b: number){
        return a + b;
    }

    @Numbers()
    getValueAtIndex(arr: any[], index: number){
        return arr[index];
    }

    @Json()
    getValueAtProperty(obj: object, key: string){
        return obj[key];
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

