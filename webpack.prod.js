import { merge } from "webpack-merge";
import common from "./webpack.common.js";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

export default merge(common, {
    mode: "production",
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
        ]
    },
    optimization: {
        minimizer: [
            "...",
            new CssMinimizerPlugin(),
        ],
    },
    plugins: [new MiniCssExtractPlugin({
            filename: "[name].[contenthash].css"
        }),
    ],
});