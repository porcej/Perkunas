module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "/Dashboard/" : "/",
  devServer: {
    // https: true,
    disableHostCheck: true,
  },
};