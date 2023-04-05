import type api from './server';
import createClient from 'typescript-rpc/createClient';

const client = createClient<typeof api>();

const print = (str: string) => {
    document.body.innerHTML += str + '<br />';
};

(async () => {
    const a = 1;
    const b = 2;
    let response: any = await client.get().add(1, 2);
    print(`${a} + ${b} = ${response} as ${typeof response}`);

    const arr = [1, 2, 3];
    const index = 2;
    response = await client.get().getValueAtIndex(arr, index);
    print(`Value at index ${index} in [${arr.join(', ')}] = ${response} as ${typeof response}`);

    const obj = { a: 1, b: 2, c: 3 };
    const key = 'b';
    response = await client.get().getValueAtProperty(obj, key);
    print(`Value at key [${key}] in <pre>${JSON.stringify(obj, null, 2)}</pre> = ${response} as ${typeof response}`);

    response = [
        await client.get().getValueAtProperty(obj, key),
        await client.get().getValueAtIndex(arr, index),
    ];
    print(`Client Side Addition ${obj[key]} + ${arr[index]} = ${response[0] + response[1]} as [${typeof response[0]}, ${typeof response[1]}]`);

    response = await client.get().add(
        await client.get().getValueAtProperty(obj, key),
        await client.get().getValueAtIndex(arr, index)
    );
    print(`Server Side Addition ${obj[key]} + ${arr[index]} = ${response} as ${typeof response}`);

    const obj2 = { a: '1', b: 2, c: '3' };
    const key2 = 'c';
    response = await client.get().getValueAtProperty(obj2, key2);
    print(`Value at key [${key2}] in <pre>${JSON.stringify(obj2, null, 2)}</pre> = ${response} as ${typeof response}`);
})();

export default client;
