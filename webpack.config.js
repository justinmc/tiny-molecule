const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    library: 'tiny-molecule',
    libraryTarget: 'commonjs2',
  },
  externals: {
    'parse-pdb': {
      commonjs: 'parse-pdb',
      commonjs2: 'parse-pdb',
    },
    three: {
      commonjs: 'three',
      commonjs2: 'three',
      root: 'THREE',
    },
    'three/examples/js/controls/OrbitControls': {
      commonjs: 'three/examples/js/controls/OrbitControls',
      commonjs2: 'three/examples/js/controls/OrbitControls',
    },
  },
  module: {
    rules: [
      {
        test: require.resolve('three/examples/js/controls/OrbitControls'),
        use: ['imports-loader?THREE=THREE', 'exports-loader?THREE.OrbitControls'],
      },
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
};
