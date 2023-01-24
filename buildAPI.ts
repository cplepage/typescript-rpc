// source: https://stackoverflow.com/a/31194949
import {type} from "os";
import {build} from "esbuild";

function $args(func) {
    return (func + '')
        .replace(/[/][/].*$/gm, '') // strip single-line comments
        .replace(/\s+/g, '') // strip white space
        .replace(/[/][*][^/*]*[*][/]/g, '') // strip multi-line comments
        .split('){', 1)[0]
        .replace(/^[^(]*[(]/, '') // extract the parameters
        .replace(/=[^,]+/g, '') // strip any ES6 defaults
        .split(',')
        .filter(Boolean); // split & filter [""]
}

function buildAPI(serverObj) {
    if(serverObj.originalFunction) {
        return buildAPI(serverObj.originalFunction);
    }

    if(typeof serverObj === 'function') {
        return $args(serverObj);
    }

    const api = {};
    Object.keys(serverObj).forEach((key) => {
        api[key] = buildAPI(serverObj[key]);
    });
    return api;
}

export default buildAPI;
