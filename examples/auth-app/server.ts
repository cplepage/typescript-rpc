import * as http from "http";
import {readFileSync} from "fs";
import createHandler from "typescript-rpc/createHandler";
import Api from "./api";
import {activeTokens, users} from "./api/Data";

const api = new Api();

export default api;

const rpcHandler = createHandler(api);

setInterval(() => {
    console.log(`Active tokens count : [${activeTokens.size}]  User count : [${users.size}]`)
}, 5000);

http.createServer(async (req, res) => {
    console.log(req?.method, req?.url);

    const sending = rpcHandler(req, res);

    if(sending) return;

    if(req?.url?.endsWith("client.js")){
        res.end(readFileSync("client.js"));
        return;
    }

    res.end(`
        <style>*{font-family: sans-serif}label{font-weight: bold}</style>
        <div id="root"></div>
        <script src='/client.js'></script>
    `);
}).listen(8000);

console.log("Listenning at http://localhost:8000");

