import buble from 'rollup-plugin-buble';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default [{
  input: 'src/index.js',
  external: ['adaptive-bezier-curve', 'transformation-matrix'],
  plugins: [
    buble()
  ],
  output: {
    file: 'dist/index.es.js',
    format: 'es',
    sourcemap: true
  }
}, {
  input: 'src/index.js',
  plugins: [
    buble(),
    resolve(),
    commonjs()
  ],
  output:
  {
    file: 'dist/index.umd.js',
    name: 'StraightLineCanvas',
    format: 'umd',
    sourcemap: true
  }
}]
