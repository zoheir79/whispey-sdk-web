const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/adexgenie-widget-react.tsx',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'adexgenie-widget.min.js',
    library: 'AdexGenie',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  // Don't externalize React - include it in the bundle
  externals: {},
};
