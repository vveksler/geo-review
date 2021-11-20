const UglifyJSPlugin = require("uglifyjs-webpack-plugin");

const config = {
  output: {
    filename: "main.bundle.js",
  },
  plugins: [
    new UglifyJSPlugin({
      sourceMap: true,
    }),
  ],
};

module.exports = config;
