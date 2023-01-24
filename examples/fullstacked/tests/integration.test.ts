import testIntegration from "fullstacked/utils/testIntegration";
import {after, before, describe, it} from "mocha";
import Server from "fullstacked/server";
import {equal} from "assert";
import createClient from "typescript-rpc/createClient";
import api from "../server";

import "../server/index";

testIntegration(describe("typescript-rpc integration tests", function() {
    let client;
    before(async function (){
        Server.start();
        client = createClient<typeof api>("http://localhost");
        await client.ready();
    });

    it("Should get Hello World", async () => {
        equal(await client.hello("Hello"), "Hello World");
    });

    after(async function(){
        Server.stop();
    });
}));
