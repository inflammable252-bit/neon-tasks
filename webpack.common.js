import path from "node:path";
import HtmlWebpackPlugin from "html-webpack-plugin";

export default {
    entry: "./src/index.js",
    output: {
        filename: "main.js",
        path: path.resolve(import.meta.dirname, "dist"),
        clean: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/template.html",
        }),
    ],
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.html$/i,
                use: ["html-loader"],
            },
            {
                test: /\.(jpg|jpeg|svg|png)$/i,
                type: "asset/resource",
            }
        ],
    },
};