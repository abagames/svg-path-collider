const path = require("path");

module.exports = function(env) {
  var config = {
    mode: process.env.WEBPACK_SERVE ? "development" : "production",
    resolve: {
      extensions: [".ts", ".js"],
      modules: ["node_modules", "web_modules"]
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /(node_modules|web_modules)/,
          loader: "awesome-typescript-loader"
        }
      ]
    }
  };
  if (env == null || env.sample == null) {
    config.entry = "./src/index.ts";
    config.output = {
      path: path.join(__dirname, "/docs/svg-path-collider"),
      filename: "index.js",
      library: ["spc"],
      libraryTarget: "umd"
    };
  } else {
    var sample = env.sample;
    config.entry = "./src/samples/" + sample + ".ts";
    config.output = {
      path: path.join(__dirname, "/docs/samples"),
      filename: sample + ".js"
    };
  }
  return config;
};
