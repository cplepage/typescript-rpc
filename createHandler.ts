import type { IncomingMessage } from 'http';
import buildAPI from './buildAPI';
import {type} from "os";


export function Get(): any {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const original = descriptor.value;
        descriptor.value = {
            wrapped: function(method, ...args){
                if(method !== "GET") return "Wrong Method!";
                return original(...args);
            },
            original
        }
    };
}

export function Post(): any {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const original = descriptor.value;
        descriptor.value = {
            wrapped: function(method, ...args){
                if(method !== "POST") return "Wrong Method!";
                return original.bind(this)(...args);
            },
            original
        }
    };
}

export function Put(): any {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const original = descriptor.value;
        descriptor.value = {
            wrapped: function(method, ...args){
                if(method !== "PUT") return "Wrong Method!";
                return original(...args);
            },
            original
        }
    };
}

export function Delete(): any {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const original = descriptor.value;
        descriptor.value = {
            wrapped: function(method, ...args){
                if(method !== "DELETE") return "Wrong Method!";
                return original(...args);
            },
            original
        }
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

        let instance;
        let method = methodPath.reduce((api, key, index) => {
            if(index === methodPath.length - 1 && api?.instance)
                instance = api.instance;
            return api[key]
        }, apiDefinition);

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

        if (method.wrapped) {
            method = method.wrapped;
            args.unshift(req.method);
        }

        res.end(JSON.stringify(await method.bind(instance)(...args)));
    };
}
