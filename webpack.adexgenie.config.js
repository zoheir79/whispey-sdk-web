const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/adexgenie-widget.js',
  output: {
    filename: 'adexgenie-widget.min.js',
    path: path.resolve(__dirname, 'public'),
    library: {
      name: 'AdexGenieWidget',
      type: 'umd',
      export: 'default',
    },
    globalObject: 'this',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js'],
  },
  optimization: {
    minimize: true,
  },
};
