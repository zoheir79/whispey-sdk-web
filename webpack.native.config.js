const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/adexgenie-widget-native.js',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'adexgenie-widget-native.min.js',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js'],
  },
};
