const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './example/app.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'example.bundle.js',
  },
  devtool: 'inline-source-map',
  plugins: [new HtmlWebpackPlugin()],
  module: {
    rules: [
      {
        test: require.resolve('three/examples/js/controls/OrbitControls'),
        use: [
          'imports-loader?THREE=THREE',
          'exports-loader?THREE.OrbitControls',
        ],
      },
    ],
  },
};
