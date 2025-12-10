module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "/Dashboard/" : "/",
  devServer: {
    allowedHosts: "all",
    host: "0.0.0.0",
    port: 8080,
    // Polling is handled by CHOKIDAR_USEPOLLING environment variable in docker-compose
  },
};
