import path from "path";
import { container, DefinePlugin } from "@rspack/core";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

import { pluginSvgr } from "@rsbuild/plugin-svgr";

const { ModuleFederationPlugin } = container;
import { fileURLToPath } from "url";

// Reconstruct __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = (env, argv) => {
  const isProduction = argv.mode === "production";
  const PUBLIC_URL = process.env.PUBLIC_URL || "/";

  return {
    entry: {
      main: "./src/index.tsx",
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: isProduction ? "[name].[contenthash].js" : "[name].js",
      publicPath: PUBLIC_URL,
    },
    devtool: isProduction ? "source-map" : "inline-source-map",
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          use: {
            loader: "builtin:swc-loader",
            options: {
              jsc: {
                parser: {
                  syntax: "typescript",
                  tsx: true,
                },
                transform: {
                  react: {
                    runtime: "automatic",
                  },
                },
              },
            },
          },
        },
        {
          test: /\.css$/,
          use: [
            { loader: "style-loader" },
            { 
              loader: "css-loader",
              options: {
                importLoaders: 1,
              }
            },
            { 
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  plugins: [
                    tailwindcss,
                    autoprefixer,
                  ],
                },
              }
            }
          ],
        },
        {
          test: /\.(png|jpg|jpeg|gif)$/i,
          type: "asset/resource",
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: "asset/resource",
        },
        {
          test: /\.svg$/i,
          issuer: /\.[jt]sx?$/,
          use: ["@svgr/webpack"],
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js", ".jsx"],
      alias: {
        "@": path.resolve(__dirname, "src"),
        components: path.resolve(__dirname, "src/components/"),
        utils: path.resolve(__dirname, "src/utils/"),
        assets: path.resolve(__dirname, "src/assets/"),
      },
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: "./public/index.html",
        favicon: "./public/favicon.ico",
      }),
      // TypeScript type checking in a separate process
      new ForkTsCheckerWebpackPlugin({
        async: !isProduction, // In development mode, don't block the build
        typescript: {
          configFile: path.resolve(__dirname, "./tsconfig.json"),
          mode: "write-references", // Recommended for monorepos
          diagnosticOptions: {
            semantic: true,
            syntactic: true,
          },
          memoryLimit: 4096, // Increase memory limit if needed for large projects
          profile: true, // Enable to see performance profiling
        },
        issue: {
          include: [{ file: "src/**/*.{ts,tsx}" }],
          exclude: [
            { file: "node_modules/**/*.{ts,tsx}" },
            { file: "**/*.d.ts" },
          ],
        },
        // logger: {

        // },
      }),
      new DefinePlugin({
        "process.env.REACT_APP_AUTH_BASE_URL": JSON.stringify(
          process.env.REACT_APP_AUTH_BASE_URL
        ),
        "process.env.REACT_APP_APPLICATION_BASE_URL": JSON.stringify(
          process.env.REACT_APP_APPLICATION_BASE_URL
        ),
      }),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, "public"),
      },
      historyApiFallback: true,
      port: 9000,
      hot: true,
    },
    optimization: {
      moduleIds: "deterministic",
      runtimeChunk: "single",
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
        },
      },
    },
  };
};

export default config;
