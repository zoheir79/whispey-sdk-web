const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/adexgenie-shadow-widget.tsx',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'adexgenie-shadow.min.js',
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
        test: /\.css$/i,
        use: ['css-loader', 'postcss-loader'],
        exclude: /node_modules/,
      },
    ],
  },
  externals: {},
};
