module.exports = {
    publicPath: process.env.NODE_ENV === 'production'
    ? '/Dashboard/'
    : '/',
  devServer: {
    host: "FIRE-173822VMA.local",
    // https: true,
    disableHostCheck: true,
    public: "FIRE-173822VMA.local:8080",
  },
};
