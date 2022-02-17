const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')

module.exports = {
    entry: {
        main: path.resolve(__dirname, '../src/script.js'),
        marscalendar: path.resolve(__dirname, '../src/marscalendar/marscalendar.js'),
        aeolis: path.resolve(__dirname, '../src/aeolis/script.js'),
    },

    output:
    {
        hashFunction: 'xxhash64',
        filename: '[name].bundle.[contenthash].js',
        path: path.resolve(__dirname, '../dist')
    },
    
    optimization: {
        runtimeChunk: 'single',
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
            filename: 'index.html',
            template: path.resolve(__dirname, '../src/index.html'),
            chunks: ['main'],
            minify: true,
            cache : true,
        }),
        new HtmlWebpackPlugin({
            filename: 'marscalendar/index.html',
            template: path.resolve(__dirname, '../src/marscalendar/marscalendar.html'),
            chunks: ['marscalendar'],
            minify: true,
            cache : true,
        }),
        new HtmlWebpackPlugin({
            filename: 'aeolis/index.html',
            template: path.resolve(__dirname, '../src/aeolis/index.html'),
            chunks: ['aeolis'],
            minify: true,
            cache : true,
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
