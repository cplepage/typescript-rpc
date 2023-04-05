import type api from "./server";
import createClient from "typescript-rpc/createClient";
import main from "./main";

export const client = createClient<typeof api>();

main();

