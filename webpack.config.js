const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: require.resolve('three/examples/js/controls/OrbitControls'),
        use: ['imports-loader?THREE=THREE', 'exports-loader?THREE.OrbitControls'],
      },
    ],
  },
};
