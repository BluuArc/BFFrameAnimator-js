import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'js/app.js',
  output: {
    file: 'js/app-bundle.js',
    format: 'iife',
    name: 'App',
    sourcemap: true,
  },
  plugins: [resolve()]
};
