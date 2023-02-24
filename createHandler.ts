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
            const middlewareReturnedValue = wrappingFunction.bind(this)(...args);

            if(middlewareReturnedValue?.args)
                args = middlewareReturnedValue.args;

            Object.assign(this, middlewareReturnedValue);

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

function maybeNumber(value){
    const floatValue = parseFloat(value);
    return floatValue.toString() === value ? floatValue : value;
}

export function Numbers(): any {
    return Middleware(function (...args){
        args = args.map(arg => {
            if(typeof arg === "object" && Array.isArray(arg)){
                return arg.map(maybeNumber);
            }

            return maybeNumber(arg)
        });
        return {args};
    })
}

export function Json(): any {
    return Middleware(function (...args){
        args = args.map(arg => {
            try{
                return JSON.parse(arg);
            }catch (e) {
                return arg;
            }
        });
        return {args};
    })
}

export function Middleware(wrappingFunction: Function): any {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if(!descriptor){
            const keys = Object.getOwnPropertyNames(Object.getPrototypeOf(new target));
            keys.forEach(key => {
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

function callAPIMethod(req, res, method, ...args): true | Promise<true>{
    let response;
    try{
        response = method.bind(req)(...args);
    }catch (e){
        response = {error: e.message};
    }

    const makeSureItsString = (obj: any) => {
        if(!obj) return obj;

        let headers = {};

        if (typeof obj !== "string") {
            obj = JSON.stringify(obj);
            headers["Content-Type"] = "application/json";
        }

        res.writeHead(200, headers);

        return obj;
    }

    if(response instanceof Promise) {
        return new Promise(resolve => {
            response
                .then(awaitedResponse => res.end(makeSureItsString(awaitedResponse)))
                .catch(error => res.end(makeSureItsString({error: error.message})))
                .finally(() => resolve(true));
        });
    }

    res.end(makeSureItsString(response));
    return true;
}

export default function createHandler(apiRaw) {
    const apiDefinition = convertClassesToObjRecursively(apiRaw);
    const api = buildAPI(apiDefinition);

    return function (req, res) : Boolean | Promise<Boolean> {
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

        if(typeof method === "object" && method[""])
            method = method[""];

        if (method.middleware) {
            method = method.middleware;
        }

        const argsName = methodPath.reduce((api, key) => api[key], api);

        if (req.method === 'POST' || req.method === 'PUT') {
            return new Promise<Boolean>(resolve => {
                readBody(req).then(body => {
                    const args = argsName.map((arg) => body[arg]);
                    const apiCall = callAPIMethod(req, res, method, ...args);
                    if(apiCall instanceof Promise)
                        apiCall.then(() => resolve(true));
                    else
                        resolve(true);
                });
            })
        }

        let args = [];
        if(argsName.length){
            const queryParams = fastQueryString.parse(urlComponents.join("?"));
            args = argsName.map((arg) => queryParams[arg] ?? undefined);
        }

        return callAPIMethod(req, res, method, ...args);;
    };
}
