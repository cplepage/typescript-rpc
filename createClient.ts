class Client<ApiDefinition> {
    private origin;
    private recurseInProxy(method: "GET" | "POST" | "PUT" | "DELETE", pathComponents: string[] = []){
        return new Proxy(fetchCall.bind(this), {
            apply: (target, _, argArray) => {
                return target(method, pathComponents, ...argArray);
            },
            get: (_, p) =>  {
                pathComponents.push(p as string);
                return this.recurseInProxy(method, pathComponents);
            }
        })
    }
    headers: {[key: string]: string} = {};

    constructor(origin) {
        this.origin = origin;
    }

    get(){ return this.recurseInProxy("GET") as any as ApiDefinition }
    post(){ return this.recurseInProxy("POST") as any as ApiDefinition }
    put(){ return this.recurseInProxy("PUT") as any as ApiDefinition }
    delete(){ return this.recurseInProxy("DELETE") as any as ApiDefinition }
}

async function fetchCall(method, pathComponents, ...args) {
    const url = new URL(this.origin || window.location.origin);

    url.pathname += (url.pathname.endsWith("/") ? "" : "/") + pathComponents.join('/');

    const requestInit: RequestInit = {
        method
    };

    const headers = new Headers();

    switch (requestInit.method) {
        case 'POST':
        case 'PUT': {
            const body = {};
            args.forEach((value, index) => body[index] = value);
            requestInit.body = JSON.stringify(body);
            break;
        }
        default:
            args.forEach((value, index) => {
                const isObject = typeof value === "object";

                if (!isObject) {
                    url.searchParams.append(index.toString(), value);
                    return;
                }

                headers.append('Content-Type', "application/json");
                url.searchParams.append(index.toString(), JSON.stringify(value));
            });
    }

    Object.keys(this.headers).forEach(headerName => {
        headers.append(headerName, this.headers[headerName]);
    });
    requestInit.headers = headers;

    const response = await fetch(url.toString(), requestInit);

    const data = response.headers.get('Content-Type') === "application/json"
        ? await response.json()
        : await response.text();

    if(response.status >= 400)
        throw new Error(data);

    return data;
}

type OnlyOnePromise<T> = T extends PromiseLike<any>
    ? T
    : Promise<T>;

type AwaitAll<T> = {
    [K in keyof T]:  T[K] extends ((...args: any) => any)
        ? (...args: T[K] extends ((...args: infer P) => any) ? P : never[]) =>
            OnlyOnePromise<(T[K] extends ((...args: any) => any) ? ReturnType<T[K]> : any)>
        : AwaitAll<T[K]>
}

export default function createClient<ApiDefinition>(origin = "") {
    return new Client<ApiDefinition>(origin) as {
        headers: Client<ApiDefinition>['headers'],
        get(): AwaitAll<ApiDefinition>,
        post(): AwaitAll<ApiDefinition>,
        put(): AwaitAll<ApiDefinition>,
        delete(): AwaitAll<ApiDefinition>,
    };
}
