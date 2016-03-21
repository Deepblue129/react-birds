// Resources used to create config:
// http://survivejs.com/webpack_react/developing_with_webpack/
// http://survivejs.com/webpack_react/webpack_and_react/
// https://github.com/kriasoft/react-starter-kit

const webpack = require('webpack'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    CleanWebpackPlugin = require('clean-webpack-plugin'),
    merge = require('webpack-merge'),
    path = require('path'),
    autoprefixer = require('autoprefixer'),
    precss = require('precss'),
    TARGET = process.env.npm_lifecycle_event,
    PATHS = {};

PATHS.root = path.join(__dirname);
PATHS.build = path.join(PATHS.root, 'build'); // DO NOT CHANGE ACCIDENTLY. EVERYTHING THING HERE GETS DELETED RECURSIVELY DURING BUILD.
PATHS.view = path.join(PATHS.root, 'view');
PATHS.component = path.join(PATHS.root, 'component');
PATHS.lib = path.join(PATHS.root, 'lib');
PATHS.styles = path.join(PATHS.view, 'styles');

process.env.BABEL_ENV = TARGET;

const common = {
    resolve: {
        extensions: ['', '.js', '.jsx'],
        alias: {
            'styles': PATHS.styles,
            'component': PATHS.component,
            'lib': PATHS.lib
        }
    },
    module: {
        preLoaders: [
            // Only lint src files
            {
                test: /\.jsx?$/,
                loaders: ['eslint'],
                include: [PATHS.view, PATHS.component]
            }, {
                test: /\.(sass|scss)$/,
                loaders: ['stylelint-loader'],
                include: [PATHS.view, PATHS.component]
            }
        ],
        loaders: [{
            test: /\.json$/,
            loader: 'json-loader'
        }, {
            test: /\.txt$/,
            loader: 'raw-loader'
        }, {
            test: /\.(png|jpg|jpeg|gif|svg|woff|woff2)$/,
            loader: 'url-loader?limit=10000'
        }, {
            test: /\.(eot|ttf|wav|mp3)$/,
            loader: 'file-loader'
        }]
    },
    externals: {
        three: {
            root: 'Three',
            commonjs: 'three',
            commonjs2: 'three',
            amd: 'three'
        }
    },
    postcss: function() {
        return [autoprefixer, precss];
    }
};

if (TARGET === 'start' || !TARGET) {
    module.exports = merge(common, {
        entry: {
            app: path.join(PATHS.view, 'entry.jsx'),
            style: path.join(PATHS.styles, 'global.scss')
        },
        output: {
            path: PATHS.build,
            filename: '[name].js'
        },
        module: {
            loaders: [{
                test: /\.(sass|scss)$/,
                loaders: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader?sourceMap'],
                include: [PATHS.view, PATHS.component, PATHS.lib]
            }, {
                test: /\.jsx?$/,
                loaders: ['react-hot', 'babel?cacheDirectory'],
                include: [PATHS.view, PATHS.component, PATHS.lib]
            }]
        },
        devtool: 'eval-source-map',
        cache: true,
        debug: true,
        devServer: {
            // Enable history API fallback so HTML5 History API based
            // routing works. This is a good default that will come
            // in handy in more complicated setups.
            historyApiFallback: true,
            hot: true,
            inline: true,
            progress: true,
            // Display only errors to reduce the amount of output.
            stats: 'errors-only',

            // Parse host and port from env so this is easy to customize.
            //
            // If you use Vagrant or Cloud9, set
            // host: process.env.HOST || '0.0.0.0';
            //
            // 0.0.0.0 is available to all network devices unlike default
            // localhost
            host: process.env.HOST,
            port: process.env.PORT
        },
        plugins: [
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NoErrorsPlugin(),
            new HtmlWebpackPlugin({
                title: 'Gallary',
                devServer: process.env.PORT,
                inject: true,
                filename: 'index.html',
                template: path.join(PATHS.view, 'template.html')
            })
        ]
    });
}

if (TARGET === 'build' || TARGET === 'stats') {
    module.exports = merge(common, {
        entry: {
            app: path.join(PATHS.component, 'index.jsx')
        },
        output: {
            path: PATHS.build,
            filename: 'Component.js',
            libraryTarget: 'umd2'
        },
        module: {
            loaders: [{
                test: /\.(sass|scss)$/,
                loaders: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'],
                include: [PATHS.view, PATHS.component, PATHS.lib]
            }, {
                test: /\.jsx?$/,
                loaders: ['babel'],
                include: [PATHS.view, PATHS.component, PATHS.lib]
            }]
        },
        externals: {
            react: {
                root: 'React',
                commonjs: 'react',
                commonjs2: 'react',
                amd: 'react'
            },
            'react-dom': {
                root: 'ReactDOM',
                commonjs: 'react-dom',
                commonjs2: 'react-dom',
                amd: 'react-dom'
            }
        },
        plugins: [
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                },
                minimize: true,
                sourceMap: false
            }),
            new CleanWebpackPlugin([PATHS.build]),
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify('production')
                }
            })
        ]
    });
}
