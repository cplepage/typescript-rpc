import type api from "./server";
import createClient from "typescript-rpc/createClient";

const client = createClient<typeof api>();

(async () => {
    document.body.innerHTML = await client.hello("Hi");
})()

export default client;
