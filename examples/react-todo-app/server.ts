import * as http from 'http';
import { readFileSync } from 'fs';
import createHandler from 'typescript-rpc/createHandler';
import Todos from "./todo-api";

const api = {
    todos: new Todos(),
};

export default api;

const rpcHandler = createHandler(api);

http
  .createServer(async (req, res) => {
    console.log(req?.method, req?.url);

    await rpcHandler(req, res);

    if (res.headersSent) return;

    if (req?.url?.endsWith('client.js')) {
      res.writeHead(200, { 'Content-Type': 'text/javascript' });
      res.end(readFileSync('client.js'));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(
      `<style>*{font-family: sans-serif}</style>
    <div id='root'></div>
    <script type='module' src='/client.js'></script>`
    );
  })
  .listen(8000);

console.log('Listenning at http://localhost:8000');
