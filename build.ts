import {buildSync} from "esbuild";

[
    "buildAPI.ts",
    "createClient.ts",
    "createHandler.ts"
].forEach(file => buildSync({
    entryPoints: [file],
    outfile: file.slice(0, -2) + "js",
    bundle: true,
    format: "cjs"
}))
