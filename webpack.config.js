const path = require('path');
const defaultConfig = require('@wordpress/scripts/config/webpack.config');

const config = {
  ...defaultConfig,
  entry: {
    index: path.resolve(process.cwd(), 'src/gutenberg/', 'index.js'),
  },
  output: {
    filename: 'gcw-editor.js',
    path: path.resolve(process.cwd(), 'dist/'),
  },
};

module.exports = config;