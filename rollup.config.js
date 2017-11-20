import replace from 'rollup-plugin-replace';
import vue from 'rollup-plugin-vue';
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
    replace({
      'process.env.NODE_ENV': JSON.stringify( 'development' )
    }),
    resolve(),
    commonjs({
      include: ['node_modules/**'],
    }),
    vue({ css: 'dist/powercalculator.css' }),
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
