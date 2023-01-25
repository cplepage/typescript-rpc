import type api from "./server";
import createClient from "typescript-rpc/createClient";
import main from "./main";

const client = createClient<typeof api>();

(async () => {
    await client.ready();
    return main();
})()

export default client;

