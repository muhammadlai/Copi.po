const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isGitHubPages ? "/Copi.po" : "",
  images: { unoptimized: true },
};

export default nextConfig;
