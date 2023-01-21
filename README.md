# TypeScript RPC

Another attempt to a TypeScript end-to-end type safe framework.

[![Npm package version](https://badgen.net/npm/v/typescript-rpc)](https://npmjs.com/package/typescript-rpc)
```
npm i typescript-rpc
```

## Autocompletion Heaven

![Autocomplete in webstorm](https://files.cplepage.com/typescript-rpc/typescript-rpc-autocomplete.png)

## Usage

```ts
// server.ts
import createHandler from "typescript-rpc/createHandler";
import {randomUUID} from "crypto";
import * as http from "http";

// define your api
const api = {
    async hello(greeting: string) {
        return greeting + " World";
    },
    // you can nest and regroup methods
    foo: {
        bar: {
            baz: {
                async create(item: Item) {
                    const id = randomUUID();
                    items.set(id, item);
                    return id;
                },
                async read(id: string) {
                    return items.get(id);
                },
                async update(id: string, item: Item) {
                    items.set(id, item);
                },
                async delete(id: string) {
                    items.delete(id);
                }
            }
        }
    }
}

type Item = { attr: string }
const items = new Map<string, Item>();

// make sure to export your api
export default api;

// create your request handler
const handler = createHandler(api);

// pass it to your server
http.createServer(handler).listen(8000);
```

```ts
// client.ts

// import type from your api definition
import type api from "./server";
import createClient from "typescript-rpc/createClient";

(async () => {
    // create your client with 
    // typeof <YOUR API DEFINITION>
    const client = createClient<typeof api>();

    // make some calls!
    const helloWorld = await client.hello("Hello");
})()
```

## Example

Checkout the `examples` directory to see how to build and bundle your files into
a functional web application.

or try on StackBlitz

**webpack-tsc-express**

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/edit/typescript-rpc-webpack-tsc-express)

**ts-node-esbuild**

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/edit/typescript-rpc-ts-node-esbuild)
