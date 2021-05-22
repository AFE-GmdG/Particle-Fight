/**
  * Webpack 5 configuration file (custom React-App-Version)
  * see https://webpack.js.org/configuration/
  * see https://webpack.js.org/configuration/dev-server/
  * ©2019, 2020, 2021 - Andreas Friedel
  */

const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

const config = {
  name: "Particle Fight",

  target: "web",

  context: path.resolve(__dirname, "src"),

  entry: {
    app: ["./app.tsx"],
  },

  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },

  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, path.join("..", "server", "dist", "client")),
    publicPath: "",
    globalObject: "self",
  },

  module: {
    rules: [{
      test: /\.tsx?$/,
      exclude: /node_modules/,
      use: [{
        loader: "ts-loader",
      }],
    }, {
      test: /\.css$/,
      use: [{
        loader: "style-loader",
      }, {
        loader: "css-loader",
        options: {
          url: (uri, _resourcePath) => {
            if (uri.includes(".ttf")) {
              return false;
            }
            return true;
          },
        },
      }],
    }, {
      test: /\.(png|jpe?g|gif)$/,
      exclude: /node_modules/,
      use: [{
        loader: "file-loader",
        options: {
          name: "[path][name].[ext]",
        },
      }],
    }, {
      test: /favicon\.ico$/,
      exclude: /node_modules/,
      use: [{
        loader: "file-loader",
        options: {
          name: "favicon.ico",
        },
      }],
    }],
  },

  performance: {
    hints: "warning",
    maxEntrypointSize: 4194304,
    maxAssetSize: 4194304,
  },

  plugins: [
    new CopyWebpackPlugin({
      patterns: [{
        from: path.resolve(__dirname, path.join("src", "assets")),
        to: path.resolve(__dirname, path.join("..", "server", "dist", "client", "assets")),
        globOptions: {
          ignore: ["**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.gif", "**/*.svg", "**/*.json", "**/*.d.ts"],
        },
      }],
    }),
    new HtmlWebpackPlugin({
      baseUrl: "/",
      filename: "index.html",
      template: "index.html",
      inject: "head",
      minify: {
        removeComments: true,
        collapseWhitespace: true,
      },
    }),
  ],
};

module.exports = (_env, argv) => {
  if (argv && argv.mode === "development") {
    return {
      ...config,

      devtool: "source-map",

      optimization: {
        emitOnErrors: false,
        minimize: false,
        runtimeChunk: "single",
        splitChunks: {
          chunks: "all",
          maxInitialRequests: Infinity,
          minSize: 0,
          cacheGroups: {
            named: {
              test: /[\\/]node_modules[\\/]/,
              name() {
                return "vendor";
              },
            },
          },
        },
      },

      plugins: [
        ...config.plugins,

        new webpack.DefinePlugin({
          // eslint-disable-next-line @typescript-eslint/naming-convention
          "process.env.NODE_ENV": JSON.stringify("development"),
          // eslint-disable-next-line global-require
          "process.env.VERSION": JSON.stringify(require("./package.json").version),
        }),
      ],

      devServer: {
        writeToDisk: false,
        historyApiFallback: true,
        public: "http://localhost:3001",
        disableHostCheck: true,
        port: 3001,
        proxy: {
          "/api": {
            target: "http://localhost:3000",
            secure: false,
          },
        },
        contentBase: path.resolve(__dirname, "dist"),
        compress: true,
        headers: {
          "Cross-Origin-Embedder-Policy": "require-corp",
          "Cross-Origin-Opener-Policy": "same-origin",
          "Cross-Origin-Resource-Policy": "cross-origin",
        },
        host: "0.0.0.0",
        inline: true,
        hot: false,
        quiet: false,
        stats: {
          colors: true,
        },
      },
    };
  }

  return {
    ...config,

    devtool: false,

    optimization: {
      emitOnErrors: false,
      minimize: true,
      runtimeChunk: "single",
      splitChunks: {
        chunks: "all",
        maxInitialRequests: Infinity,
        minSize: 0,
        cacheGroups: {
          named: {
            test: /[\\/]node_modules[\\/]/,
            name() {
              return "vendor";
            },
          },
        },
      },
    },

    plugins: [
      ...config.plugins,

      new webpack.DefinePlugin({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "process.env.NODE_ENV": JSON.stringify("production"),
        // eslint-disable-next-line global-require
        "process.env.VERSION": JSON.stringify(require("./package.json").version),
      }),
    ],
  };
};
