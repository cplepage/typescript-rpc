import {buildSync} from "esbuild";

const files = [
    "createClient.ts",
    "createHandler.ts"
];

files.forEach(file => {
    const buildOptions = {
        entryPoints: [file],
        bundle: true
    };

    buildSync({
        ...buildOptions,
        outfile: file.slice(0, -2) + "cjs",
        format: "cjs"
    });

    buildSync({
        ...buildOptions,
        outfile: file.slice(0, -2) + "mjs",
        format: "esm"
    });
})


