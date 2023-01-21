import type { IncomingMessage } from 'http';
import buildAPI from './buildAPI';

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

export default function createHandler(apiDefinition) {
    const api = buildAPI(apiDefinition);



    return async (req, res) => {
        if(req.url === "/api"){
            res.end(JSON.stringify(api));
            return;
        }

        const url = new URL('http://localhost' + req.url);
        const methodPath = url.pathname.slice(1).split('/');

        const method = methodPath.reduce((api, key) => api[key], apiDefinition);

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

        res.end(JSON.stringify(await method(...args)));
    };
}
