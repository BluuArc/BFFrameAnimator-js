import resolve from 'rollup-plugin-node-resolve';
import alias from 'rollup-plugin-alias';
import cleanup from 'rollup-plugin-cleanup';


export default {
  input: 'js/app.js',
  output: {
    file: 'public/js/app-bundle.js',
    format: 'iife',
    name: 'App',
    sourcemap: true,
  },
  plugins: [
    alias({
      vue: 'node_modules/vue/dist/vue.esm.browser.min.js',
    }),
    resolve(),
    cleanup(),
  ],
};
