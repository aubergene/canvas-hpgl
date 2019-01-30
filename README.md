# canvas-hpgl

CanvasHpgl gives a HTML Canvas compatible API for producing HPGL. It uses [canvas-polyline](https://www.npmjs.com/package/canvas-polyline) which produces all output using **only straight lines**, and then output them using the HPGL `PU` and `PD` commands.

## Usage

```js
var ctx = new CanvasHpgl() // Takes a single Canvas API contexts or an array of them
ctx.rect(0, 0, 100, 100)
// PU 0,0
// PD 100,0
// PD 100,100
// PD 0,100
// PD 0,0
```

# Backstory

My initial motivation for creating this project was so I could use the HTML Canvas API with Roland DPX-3300 plotter. The plotter only understands [HPGL](https://en.wikipedia.org/wiki/HP-GL). I started by creating [d3-hpgl](https://github.com/aubergene/d3-hpgl), which translates Canvas commands in to the equivilient HPGL, however HPGL (at least version for my plotter) doesn't have native support for quadtractics, beziers or elipses. Additionally I wanted to have support for transformations, so I created this library.

## Thanks

The code has been adapted from [d3-path](https://github.com/d3/d3-path), and uses [adaptive-bezier-curve](https://github.com/mattdesl/adaptive-bezier-curve), [adaptive-quadratic-curve](https://github.com/mattdesl/adaptive-quadratic-curve) and [transformation-matrix](https://github.com/chrvadala/transformation-matrix).
