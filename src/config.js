let env = process.env.NODE_ENV || "development";

let config = {
  development: require("./config/development.js"),
  production: require("./config/production.js"),
  staging: require("./config/staging.js"),
};

module.exports = config[env];
