import type { IncomingMessage } from 'http';
import buildAPI from './buildAPI';
import * as fastQueryString from "fast-querystring";

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

function makeSureItsString(obj: any){
    return typeof obj === "string" ? obj : JSON.stringify(obj);
}

function callAPIMethod(req, res, method, ...args){
    let response;
    try{
        response = method.bind(req)(...args);
    }catch (e){
        response = {error: e.message};
    }

    if(response instanceof Promise) {
        response
            .then(awaitedResponse => {
                res.end(makeSureItsString(awaitedResponse))
            })
            .catch(error => res.end(makeSureItsString({error: error.message})));
    }else{
        res.end(makeSureItsString(response));
    }
}

export default function createHandler(apiRaw) {
    const apiDefinition = convertClassesToObjRecursively(apiRaw);
    const api = buildAPI(apiDefinition);

    return function (req, res) {
        if(req.url === "/api"){
            res.end(JSON.stringify(api));
            return true;
        }

        const urlComponents = req.url.split("?");

        const url = urlComponents.shift();
        const methodPath = url.split('/');
        methodPath.shift();

        let method = methodPath.reduce((api, key, index) => api[key], apiDefinition);

        if(!method) return false;

        if (method.middleware) {
            method = method.middleware;
        }

        const argsName = methodPath.reduce((api, key) => api[key], api);

        if (req.method === 'POST' || req.method === 'PUT') {
            readBody(req).then(body => {
                const args = argsName.map((arg) => body[arg]);
                callAPIMethod(req, res, method, ...args);
            });
            return true;
        }

        let args = [];
        if(argsName.length){
            const queryParams = fastQueryString.parse(urlComponents.join("?"));
            args = argsName.map(
                (arg) => queryParams[arg] ?? undefined
            );
        }


        callAPIMethod(req, res, method, ...args);

        return true;
    };
}
