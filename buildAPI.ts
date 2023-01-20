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
    const api = {};
    Object.keys(serverObj).forEach((key) => {
        if (typeof serverObj[key] === 'function') api[key] = $args(serverObj[key]);
        else api[key] = buildAPI(serverObj[key]);
    });
    return api;
}

export default buildAPI;
