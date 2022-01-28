const path = require('path');
/** @type {import('webpack').Configuration[]} */
module.exports = [
    // CommonJS
    {
        mode:"production",
        entry:"./index.ts",
        module:{
            rules:[{
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }],
        },
        resolve: { extensions: ['.tsx', '.ts', '.js'], },
        output: {
            filename:'index.js',
            globalObject:"this",
            libraryTarget:"commonjs",
            path: path.resolve(__dirname, 'src')
        },
        watch:Boolean( process.env.wp_watch ),
    },

    // Browser Compatibility
    {
        mode:"production",
        entry: './index.ts',
        module: {
            rules: [{
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }],
        },
        resolve: { extensions: ['.tsx', '.ts', '.js'], },
        output: {
            library:"Bridge",
            libraryTarget:"umd",
            libraryExport:"default",
            globalObject: 'this',
            filename: 'index.min.js',
            path: path.resolve(__dirname, 'lib'),
        },
    },
]