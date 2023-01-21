import {describe, it, before, after} from "mocha";
import {ok} from "assert";
import * as path from "path";
import TestE2E from "fullstacked/utils/testE2E";
import {dirname} from "path";
import {fileURLToPath} from "url";
import sleep from "fullstacked/utils/sleep";

const __dirname = dirname(fileURLToPath(import.meta.url));

describe("typescript-rpc e2e tests", function(){
    let test;
    before(async function(){
        test = new TestE2E(path.resolve(__dirname, ".."));
        await test.start();
    });

    it('Should get Hello World', async function(){
        await sleep(300);
        const root = await test.page.$("body");
        const innerHTML = await root.getProperty('innerHTML');
        const value = await innerHTML.jsonValue();
        ok(value.endsWith( "Hello World"));
    });

    after(async function(){
        await test.stop();
    });
});
