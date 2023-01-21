const path = require("path");

module.exports = {
    entry: './client.ts',
    mode: "development",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts'],
    },
    output: {
        filename: 'client.js',
        path: path.resolve(__dirname, "static"),
    },
};
