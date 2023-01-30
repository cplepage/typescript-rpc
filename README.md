# TypeScript RPC

Another attempt to a TypeScript end-to-end type safe framework.

[![Npm package version](https://badgen.net/npm/v/typescript-rpc)](https://npmjs.com/package/typescript-rpc)
```
npm i typescript-rpc
```

## Autocompletion Heaven

![Autocomplete in webstorm](https://files.cplepage.com/typescript-rpc/typescript-rpc-autocomplete.png)
![Autocomplete in StackBlitz](https://files.cplepage.com/typescript-rpc/autocomplete.gif)

## Usage

```ts
// server.ts
import createHandler from "typescript-rpc/createHandler";
import {randomUUID} from "crypto";
import * as http from "http";

// define your api
const api = {
    hello(greeting: string) {
        return greeting + " World";
    },
    // you can nest and regroup methods
    foo: {
        bar: {
            baz: {
                create(item: Item) {
                    const id = randomUUID();
                    items.set(id, item);
                    return id;
                },
                read(id: string) {
                    return items.get(id);
                },
                update(id: string, item: Item) {
                    items.set(id, item);
                },
                delete(id: string) {
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

// create your client with 
// typeof <YOUR API DEFINITION>
const client = createClient<typeof api>();

(async () => {
    // wait for the client to be ready
    await client.ready();

    // make some calls!
    const helloWorld = await client.hello("Hello");
})()

// make sure to export your client and access it from anywhere!
export default client;
```

## Example

Checkout the `examples` directory to see how to build and bundle your files into
a functional web application.

or try on StackBlitz

### Build Examples

**esbuild**

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/edit/typescript-rpc-esbuild)

**webpack-tsc-express**

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/edit/typescript-rpc-webpack-tsc-express)

**ts-node-esbuild**

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/edit/typescript-rpc-ts-node-esbuild)

### Sample Apps

**react-todo-app**

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/edit/typescript-rpc-react-todo-app)

**auth-app**

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/edit/typescript-rpc-auth-app)

**static-site**

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/edit/typescript-rpc-static-site)

### Experiments

**data-types**

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/edit/typescript-rpc-data-types)
