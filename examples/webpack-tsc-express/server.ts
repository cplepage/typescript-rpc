import createHandler from "typescript-rpc/createHandler";
import * as express from "express";

const api = {
    hello(greeting: string){
        return greeting + " World";
    }
}

export default api;

const rpcHandler = createHandler(api);

const app = express();
const port = 8000;

app.use(express.static("./static"));

app.use(rpcHandler);

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
});

