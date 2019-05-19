const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const autoprefixer = require('autoprefixer');

module.exports = (env, argv) => {
    const isDevelopment = argv.mode !== 'production';//process.env.NODE_ENV !== 'production';
    
    return {
        entry: {
            main: './src/index.tsx',
        },
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, 'dist'),
        },
        watch: isDevelopment,
        watchOptions: !isDevelopment ? undefined : {
              poll: true,
              ignored: /node_modules/
        },
        mode: isDevelopment ? 'development' : 'production',
        devtool: isDevelopment && "source-map",
        devServer: {
            historyApiFallback: true,
            port: 3000,
            open: true
        },
        resolve: {
            extensions: ['.js', '.json', '.ts', '.tsx'],
        },

        /*optimization: isDevelopment ? undefined : {
            minimizer: [
                new UglifyJsPlugin({
                    uglifyOptions: {
                        output: {
                            comments: false
                        },
                        //ie8: false,
                        //toplevel: true
                    }
                })
            ]
        },*/
        optimization: isDevelopment ? undefined : {
            minimize: true,
        },

        module: {
            rules: [
                {
                    test: /\.(ts|tsx)$/,
                    loader: 'awesome-typescript-loader',
                },
                { 
                    test: /\.handlebars$/, 
                    loader: "handlebars-loader" 
                },
                {
                    test: /\.(scss|css)$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: "css-loader",
                            options: {
                                sourceMap: isDevelopment,
                                //minimize: !isDevelopment //removed due to error source
                            }
                        },
                        {
                            loader: "postcss-loader",
                            options: {
                                autoprefixer: {
                                    browsers: 'last 2 versions, > 1%'
                                },
                                sourceMap: isDevelopment,
                                plugins: () => [
                                    autoprefixer
                                ]
                            },
                        },
                        {
                            loader: "sass-loader",
                            options: {
                                sourceMap: isDevelopment
                            }
                        }
                    ]
                },
                /*{
                    test: /\.ttf$/,
                    use: [
                        {
                            loader: 'ttf-loader',
                            options: {
                                name: './font/[name].[ext]',
                            },
                        },
                    ]
                },*/
                {
                    test: /\.(jpe?g|png|gif|svg|ttf)$/,
                    use: [
                        {
                            loader: "file-loader",
                            options: {
                                name: '[name].[ext]',
                                outputPath: 'static/',
                                useRelativePath: true,
                            }
                        },
                        {
                            loader: 'image-webpack-loader',
                            options: {
                              mozjpeg: {
                                progressive: true,
                                quality: 90
                              },
                              optipng: {
                                enabled: true,
                              },
                              pngquant: {
                                quality: '80-90',
                                speed: 4
                              },
                              gifsicle: {
                                interlaced: false,
                              },
                              /*webp: {
                                quality: 75
                              }*/
                            }
                        }
                    ]
                }
            ],
        },

        plugins: [
            new MiniCssExtractPlugin({
                filename: "[name]-styles.css",
                chunkFilename: "[id].css"
            }),
            new HtmlWebpackPlugin({
                hash: isDevelopment,
                //favicon: './src/img/favicon.png',
                title: 'Aelios inventory',
                minify: !isDevelopment,
                template: './src/index.html',
                filename: './index.html'
            })
        ]
    };
};
