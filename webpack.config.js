const path = require("path");
const webpack = require("webpack");
const fs = require("fs");

const postcssImport = require("postcss-import");
const postcssVars = require("postcss-simple-vars");
const postcssCalc = require("postcss-calc");
const postcssNested = require("postcss-nested");
const postConditionals = require("postcss-conditionals");
const postcssPresetEnv = require("postcss-preset-env");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const config = require("config");

/*-------------------------------------------------*/

module.exports = {
  // webpack optimization mode
  mode: process.env.NODE_ENV ? process.env.NODE_ENV : "development",

  // entry file(s)
  entry: {
    main: [
      "./Resources/Private/JavaScript/main.js",
      "./Resources/Private/Styles/main.scss"
    ]
  },

  // output file(s) and chunks
  output: {
    library: "UserList",
    libraryTarget: "umd",
    libraryExport: "default",
    path: path.resolve(__dirname, "./Resources/Public"),
    filename: "./JavaScript/[name].js",
    publicPath: "/_Resources/Static/Packages/" + config.get("packagename") + "/"
  },

  // module/loaders configuration
  module: {
    rules: [
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        use: {
          loader: "file-loader",
          options: {
            outputPath: "assets/",
            publicPath: "/_Resources/Static/Packages/signalwerk.sfgz/assets/",
            name: "[name].[ext]"
          }
        }
      },
      {
        test: /\.(jpg|png|svg)$/,
        use: {
          loader: "file-loader",
          options: {
            outputPath: "assets/",
            publicPath: "/_Resources/Static/Packages/signalwerk.sfgz/assets/",
            name: "[name].[ext]"
          }
        }
      },

      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader"]
      },
      {
        test: /\.scss$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: "css-loader",
            options: { sourceMap: config.get("sourcemap") }
          },
          // Compiles Sass to CSS
          'sass-loader',
        ],
      },
      {
        test: /\.css$/,

        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: "css-loader",
            options: { sourceMap: config.get("sourcemap") }
          },
          // Compiles Sass to CSS
          // "sass-loader",
          // Add PostCSS
          {
            loader: "postcss-loader",
            options: {
              ident: "postcss",
              plugins() {
                return [
                  postcssImport({
                    root: path.resolve(__dirname, "./Resources/Private")
                  }),
                  postcssVars({
                    variables: () => {
                      if (fs.existsSync(config.cssVariables)) {
                        return config.cssVariables;
                      }
                      return {};
                    }
                  }),
                  postcssCalc(),
                  postcssPresetEnv({
                    stage: 0,
                    browsers: ["last 2 versions", "IE > 10"]
                  }),
                  postConditionals(),
                  postcssNested()
                  // postcssFlegrix(),
                  // require("cssnano")()
                ];
              },
              // Enable sourcemaps in development
              sourceMap: config.get("sourcemap")
            }
          }
        ]
      }
    ]
  },

  plugins: [
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "./Styles/[name].css",
      chunkFilename: "./Styles/[id].css"
    })
  ],

  // development server configuration
  devServer: {
    // open browser on server start
    // open: config.get("open")
    public: 'blog.sfgz.local:8080', // That solved it

    port: 8080,
    allowedHosts: [
      "sfgz.local",
      "blog.sfgz.local"
    ],
    proxy: {
      "*": "http://localhost:80"
    }
  },

  // generate source map
  devtool:
    "production" === process.env.NODE_ENV
      ? "source-map"
      : "cheap-module-eval-source-map"
};
