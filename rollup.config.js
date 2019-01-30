import buble from 'rollup-plugin-buble';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from "rollup-plugin-terser";

export default [{
  input: 'src/index.js',
  external: ['adaptive-bezier-curve', 'transformation-matrix'],
  plugins: [
    buble()
  ],
  output: {
    file: 'dist/canvas-hpgl.es.js',
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
    file: 'dist/canvas-hpgl.umd.js',
    name: 'CanvasHpgl',
    format: 'umd',
    sourcemap: true
  }
}, {
  input: 'src/index.js',
  plugins: [
    buble(),
    resolve(),
    commonjs(),
    terser()
  ],
  output:
  {
    file: 'dist/canvas-hpgl.umd.min.js',
    name: 'CanvasHpgl',
    format: 'umd',
    sourcemap: true
  }
}]
