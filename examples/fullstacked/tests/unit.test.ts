import {describe, it} from "mocha";
import api from "../server/index";
import {equal} from "assert";

describe("typescript-rpc unit tests", function(){
    it("Should return Hello World", async function (){
        equal(api.hello("Hello"), "Hello World");
    });
});
