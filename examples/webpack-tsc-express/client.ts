import type api from "./server";
import createClient from "typescript-rpc/createClient";

const client = createClient<typeof api>();

(async () => {
    await client.ready();
    document.body.innerHTML += await client.hello("Hello");
})()

