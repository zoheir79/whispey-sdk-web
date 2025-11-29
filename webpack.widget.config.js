const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './public/livekit-agent-widget.js',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'livekit-agent-widget.min.js',
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: false, // Keep console logs for debugging
          },
          format: {
            comments: false, // Remove comments
          },
        },
        extractComments: false,
      }),
    ],
  },
};
