import { NextConfig } from "next";

import CopyWebpackPlugin from "copy-webpack-plugin";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@orca-so/whirlpools-core"],
  webpack(config, { isServer }) {
    config.experiments.asyncWebAssembly = true;

    // Copy `orca_whirlpools_core_js_bindings_bg.wasm` file
    // This is only needed because of the monorepo setup
    // (local dependencies are symlinked and next doesn't like that)
    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "node_modules/@orca-so/whirlpools-core/dist/nodejs/orca_whirlpools_core_js_bindings_bg.wasm",
            to: "./server/app",
          },
        ],
      })
    );

    // The following supresses a warning about using top-level-await and is optional
    if (!isServer) {
      config.output.environment = {
        ...config.output.environment,
        asyncFunction: true,
      };
    }

    return config;
  },
};

export default nextConfig;
