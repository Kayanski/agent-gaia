import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['@anush008/tokenizers-darwin-universal', '@anush008/tokenizers', 'onnxruntime-node', 'yargs', 'handlebars']

};

export default nextConfig;
