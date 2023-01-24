import type { IncomingMessage } from 'http';
import buildAPI from './buildAPI';

function checkMethod(method: string){
    if(this.method !== method)
        throw Error(`Wrong Method. Allowed [${method}] Used [${this.method}]`);
}

function wrapFunction(originalFunction, wrappingFunction){
    return {
        middleware: function(...args) {
            Object.assign(this, wrappingFunction.bind(this)());

            if (originalFunction.middleware) {
                originalFunction = originalFunction.middleware;
            }

            return originalFunction.bind(this)(...args);
        },
        originalFunction
    }
}

export function Get(): any{
    return Middleware(function (){
        checkMethod.bind(this)("GET");
    });
}
export function Post(): any{
    return Middleware(function (){
        checkMethod.bind(this)("POST");
    });
}
export function Put(): any{
    return Middleware(function (){
        checkMethod.bind(this)("PUT");
    });
}
export function Delete(): any{
    return Middleware(function (){
        checkMethod.bind(this)("DELETE");
    });
}

export function Middleware(wrappingFunction: Function): any {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if(!descriptor){
            Object.keys(target.prototype).forEach(key => {
                target.prototype[key] = wrapFunction(target.prototype[key], wrappingFunction);
            })
            return target;
        }
        descriptor.value = wrapFunction(descriptor.value, wrappingFunction);
    };
}

function readBody(req: IncomingMessage) {
    return new Promise((resolve) => {
        let jsonString = '';

        req.on('data', function (data) {
            jsonString += data;
        });

        req.on('end', function () {
            resolve(JSON.parse(jsonString));
        });
    });
}

// source: https://stackoverflow.com/a/58568121
function classToObject (theClass) {
    const originalClass = theClass || {}
    const keys = Object.getOwnPropertyNames(Object.getPrototypeOf(originalClass))
        .concat(Object.getOwnPropertyNames(theClass))
    return keys.reduce((classAsObj, key) => {
        classAsObj[key] = originalClass[key]
        return classAsObj
    }, {})
}

// source: https://stackoverflow.com/a/63228981
function isPlainObject(obj) {
    const prototype = Object.getPrototypeOf(obj);
    return  prototype === Object.getPrototypeOf({}) ||
        prototype === null;
}

function convertClassesToObjRecursively(raw) {
    if (typeof raw === "object" && !isPlainObject(raw)) {
        raw = classToObject(raw);
    }else if(typeof raw === "function")
        return raw;

    let api: any = {};
    Object.keys(raw).forEach(key => {
        if(key === "constructor") return;
        api[key] = convertClassesToObjRecursively(raw[key]);
    });
    return api;
}

export default function createHandler(apiRaw) {
    const apiDefinition = convertClassesToObjRecursively(apiRaw);
    const api = buildAPI(apiDefinition);

    return async (req, res) => {
        if(req.url === "/api"){
            res.end(JSON.stringify(api));
            return;
        }

        const url = new URL('http://localhost' + req.url);
        const methodPath = url.pathname.slice(1).split('/');

        let method = methodPath.reduce((api, key, index) => api[key], apiDefinition);

        if(!method) return;

        const argsName = methodPath.reduce((api, key) => api[key], api);

        let args;
        if (req.method === 'POST' || req.method === 'PUT') {
            const body = await readBody(req);
            args = argsName.map((arg) => body[arg]);
        } else {
            args = argsName.map(
                (arg) => JSON.parse(url.searchParams.get(arg)) ?? undefined
            );
        }

        if (method.middleware) {
            method = method.middleware;
        }

        let response;
        try{
            response = await method.bind(req)(...args);
        }catch (e){
            response = e.message;
        }

        res.end(JSON.stringify(response));
    };
}
