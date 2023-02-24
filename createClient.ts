class Client<ApiDefinition> {
    private api;
    private origin;
    private initialized: boolean = false;
    private readyCallbacks: (() => void)[] = [];
    headers: {[key: string]: string} = {};

    constructor(origin) {
        this.origin = origin;
        fetch(`${origin}/api`)
            .then(response => response.json())
            .then(api => {
                buildClientRecursive(this, api, []);
                this.api = api;
                this.initialized = true;
                this.readyCallbacks.forEach(cb => cb());
            });
    }

    ready(): Promise<void>{
        return new Promise(resolve => {
            if(this.initialized) resolve();
            this.readyCallbacks.push(resolve);
        })
    }

    private clone() {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    }

    get(): ApiDefinition {
        return this as any as ApiDefinition;
    }

    post(): ApiDefinition {
        const clone = this.clone();
        clone.method = 'POST';
        buildClientRecursive(clone, this.api, []);
        return clone;
    }

    put(): ApiDefinition {
        const clone = this.clone();
        clone.method = 'PUT';
        buildClientRecursive(clone, this.api, []);
        return clone;
    }

    delete(): ApiDefinition {
        const clone = this.clone();
        clone.method = 'DELETE';
        buildClientRecursive(clone, this.api, []);
        return clone;
    }
}

async function fetchCall(pathComponents, ...args) {
    const url = new URL(this.origin || window.location.origin);

    url.pathname = '/' + pathComponents.join('/');

    const requestInit: RequestInit = {
        method: this.method ?? 'GET',
    };

    const argsName = pathComponents.reduce((api, key) => api[key], this.api);

    switch (requestInit.method) {
        case 'POST':
        case 'PUT': {
            const body = {};
            args.forEach((value, index) => body[argsName[index]] = value);
            requestInit.body = JSON.stringify(body);
            break;
        }
        default:
            args.forEach((value, index) => {
                const isObject = typeof value === "object";

                if(!isObject) {
                    url.searchParams.append(argsName[index], value);
                    return;
                }

                if(Array.isArray(value)){
                    value.forEach(item => url.searchParams.append(argsName[index], item));
                    return;
                }

                url.searchParams.append(argsName[index], JSON.stringify(value));
            });
    }

    requestInit.headers = this.headers;

    const response = await fetch(url.toString(), requestInit);

    if(response.headers.get('Content-Type') === "application/json")
        return JSON.parse(await response.text());


    return response.text();
}

function buildClientRecursive(instance, api, pathComponents, member?) {
    if (!member) member = instance;

    for (const key of Object.keys(api)) {
        if (Array.isArray(api[key])) {
            member[key] = fetchCall.bind(instance, [...pathComponents, key]);
        } else {
            member[key] = {};
            buildClientRecursive(instance, api[key], [...pathComponents, key], member[key]);
        }
    }
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
    return new Client<ApiDefinition>(origin) as any as AwaitAll<ApiDefinition> & {
        headers: Client<ApiDefinition>['headers'],
        ready(): ReturnType<Client<ApiDefinition>['ready']>,
        get(): AwaitAll<ApiDefinition>,
        post(): AwaitAll<ApiDefinition>,
        put(): AwaitAll<ApiDefinition>,
        delete(): AwaitAll<ApiDefinition>,
    };
}
