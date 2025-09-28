import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginModuleFederation } from "@module-federation/rsbuild-plugin";
import { pluginSvgr } from "@rsbuild/plugin-svgr";
import { DefinePlugin } from "@rspack/core";


export default defineConfig({
  plugins: [
    pluginReact(), // Adds React + TS support out of box
    pluginModuleFederation({
      name: "remote",
      // other options
    }),
    pluginSvgr({
      svgrOptions: {
        exportType: "named",
        plugins: ["@svgr/plugin-svgo", "@svgr/plugin-jsx"],
      },
    }),
  ],
  tools: {
    css: {
      modules: {
        // Optional: customize CSS Modules naming
        localIdentName: "[name]__[local]___[hash:base64:5]",
      },
      postcss: {
        plugins: [
          require('tailwindcss'),
          require('autoprefixer'),
        ],
      },
    },
    rspack: {
      plugins: [
        new DefinePlugin({
          "process.env.NODE_ENV": JSON.stringify(""),
        }),
      ],
      resolve: {
        alias: {
          "@": "./src",
        },
      },
    },
    svgr: true, // Support importing SVG as ReactComponent
  },
  output: {
    cssModules: {
      auto: true,
      exportLocalsConvention: "camelCaseOnly",
    },
    assetPrefix: "auto",
  },
});
