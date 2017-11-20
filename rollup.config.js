import vue from 'rollup-plugin-vue';
import css from 'rollup-plugin-css-only';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

let banner = `
/** MIT licence */
/** https://github.com/bookingcom/powercalculator */
`;

export default {
  banner,
  input: 'src/index.js',
  plugins: [
    resolve(),
    commonjs({
      include: ['node_modules/**'],
    }),
    vue({ autoStyles: false, styleToImports: true }),
    css({ output: 'dist/powercalculator.css' }),
  ],
  output: {
    name: 'powercalculator',
    file: 'dist/powercalculator.js',
    format: 'umd',
    amd: {
      id: 'powercalculator'
    }
  }
}
