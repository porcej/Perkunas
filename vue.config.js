module.exports = {
  devServer: {
    host: 'FIRE-173822VMA.local',
    // https: true,
    disableHostCheck: true,   // That solved it
    public: 'FIRE-173822VMA.local:8080', // That solved it
  }
}