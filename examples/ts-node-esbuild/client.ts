import type api from "./api";
import createClient from "typescript-rpc/createClient";

(async () => {
    const client = await createClient<typeof api>();
    document.body.innerHTML = await client.hello("Hello");
})()

