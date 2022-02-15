const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')

const pages = ["script","test"];

module.exports = {
    entry: path.resolve(__dirname, '../src/script.js'),
    
    // entry: pages.reduce((config, page) => {
    //     config[page] = `./src/${page}.js`;
    //     return config;
    //   }, {}),

    output:
    {
        hashFunction: 'xxhash64',
        filename: 'bundle.[contenthash].js',
        path: path.resolve(__dirname, '../dist')
    },
    devtool: 'source-map',
    plugins:
    [
        new CopyWebpackPlugin({
            patterns: [
                { from: path.resolve(__dirname, '../static') }
            ]
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/index.html'),
            minify: true
        }),
        new MiniCSSExtractPlugin()
    ],
    module:
    {
        rules:
        [
            // HTML
            {
                test: /\.(html)$/,
                use:
                [
                    'html-loader'
                ]
            },

            // JS
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use:
                [
                    'babel-loader'
                ]
            },

            // CSS
            {
                test: /\.css$/,
                use:
                [
                    MiniCSSExtractPlugin.loader,
                    'css-loader'
                ]
            },

            // Images
            {
                test: /\.(jpg|png|gif|svg|jpeg)$/,
                type: 'asset/resource',
                generator:
                {
                    filename: 'assets/images/[hash][ext]'
                }
            },

            // Fonts
            {
                test: /\.(ttf|eot|woff|woff2)$/,
                type: 'asset/resource',
                generator:
                {
                    filename: 'assets/fonts/[hash][ext]'
                }
            },
            
            // Shaders
            {
                test: /\.(glsl|vs|fs|vert|frag)$/,
                exclude: /nodemodules/,
                use:
                [
                    'raw-loader'
                ]
                
                // test: /\.(glsl|vs|fs|vert|frag)$/,
                // type: 'asset/source',
                // generator:
                // {
                //     filename: 'assets/images/[hash][ext]'
                // }
            },

            // Audio files
            {
                test: /\.(mp3|wav|ogg|m4a)$/,
                type: 'asset/resource',
                generator:
                {
                    filename: 'assets/audio/[hash][ext]'
                }
            },
        ]
    }
}
