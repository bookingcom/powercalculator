import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

let banner = `
/** MIT licence */
/** https://github.com/bookingcom/powercalculator */
`;

export default {
  banner,
  input: 'src/js/math.js',
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify( 'development' )
    }),
    resolve(),
    commonjs({
      include: ['node_modules/**'],
    }),
  ],
  output: {
    banner: banner,
    name: 'powerMath',
    file: 'dist/power-math.js',
    format: 'umd',
    amd: {
      id: 'powerMath'
    }
  }
}
