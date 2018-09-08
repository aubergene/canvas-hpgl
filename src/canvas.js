import bezier from 'adaptive-bezier-curve'
import { identity, rotate, scale, translate, fromObject, compose, applyToPoint, inverse } from 'transformation-matrix';

const pi = Math.PI,
  tau = 2 * pi,
  epsilon = 1e-6,
  tauEpsilon = tau - epsilon,
  defaultBezierScale = 2,
  defaultArcScale = 2;

export class Canvas {
  constructor(ctx) {
    this.ctx = Array.isArray(ctx) ? ctx : [ctx]
    this._x0 = this._y0 = null; // start of current subpath
    this._x1 = this._y1 = null; // end of current subpath
    this._transforms = []
    this._matrix = identity()
    this._bezierScale = defaultBezierScale
    this._arcScale = defaultArcScale
  }

  set arcScale(_) {
    this._arcScale = _
  }
  set bezierScale(_) {
    this._bezierScale = _
  }

  rotate(a, cx, cy) {
    this._transforms.push(rotate(a, cx, cy))
    this._matrix = compose(...this._transforms)
  }
  scale(sx, sy) {
    this._transforms.push(scale(sx, sy))
    this._matrix = compose(...this._transforms)
  }
  translate(tx, ty) {
    this._transforms.push(translate(tx, ty))
    this._matrix = compose(...this._transforms)
  }
  transform(a, b, c, d, e, f) {
    this._transforms.push(fromObject({ a, b, c, d, e, f }))
    this._matrix = compose(...this._transforms)
  }
  resetTransform() {
    this._transforms = []
    this._matrix = identity()
  }

  moveTo(x, y) {
    [x, y] = applyToPoint(this._matrix, [x, y]);
    this._x0 = this._x1 = +x
    this._y0 = this._y1 = +y
    this.ctx.forEach(c => c.moveTo(x, y))
  }
  lineTo(x, y) {
    [x, y] = applyToPoint(this._matrix, [x, y]);
    this._x1 = +x
    this._y1 = +y
    this.ctx.forEach(c => c.lineTo(x, y))
  }
  closePath() {
    if (this._x1 !== null) {
      const start = applyToPoint(inverse(this._matrix), [this._x0, this._y0]);
      this.lineTo(start[0], start[1])
    }
  }
  quadraticCurveTo(x1, y1, x, y) {
    const start = applyToPoint(inverse(this._matrix), [this._x0, this._y0]);
    const point = applyToPoint(this._matrix, [x, y]);
    const points = bezier(
      start,
      [x1, y1],
      [x1, y1],
      [+x, +y],
      +this._bezierScale
    )
    this._x0 = this._x1 = point[0]
    this._y0 = this._y1 = point[1]
    points.forEach(p => {
      this.lineTo(p[0], p[1])
    })
  }
  bezierCurveTo(x1, y1, x2, y2, x, y) {
    var points = bezier(
      [this._x0, this._y0],
      [x1, y1],
      [x2, y2],
      [this._x0 = this._x1 = +x, this._y0 = this._y1 = +y],
      +this._bezierScale
    )
    points.forEach(p => {
      this.lineTo(p[0], p[1])
    })
  }
  arc(x, y, r, a0, a1, ccw) {
    this.ellipse(x, y, r, r, 0, a0, a1, ccw)
  }
  ellipse(x, y, rx, ry, rot, a0, a1, ccw) {
    if (a0 < 0) a0 = (a0 + tau) % tau
    if (a1 < 0) a1 = (a1 + tau) % tau

    const maxR = Math.max(rx, ry)

    let a = ccw ? a0 - a1 : a1 - a0
    if (a < 0) a = (a + tau) % tau
    // const inc = (a / tau) / a / Math.sqrt(r / 50)
    // const inc = (1 / tau) / this._arcScale / Math.sqrt(r)
    // const inc = Math.sqrt(2 * maxR * this._arcScale - (Math.pow(this._arcScale, 2)))
    // const inc = 1 / Math.sqrt(2 * maxR * this._arcScale - (Math.pow(this._arcScale, 2)))
    const inc = 1 / Math.sqrt(maxR * this._arcScale - (Math.pow(this._arcScale, 2)))
    const n = Math.ceil(a / inc)
    const cw = ccw ? -1 : 1

    console.log('_arcScale', this._arcScale, 'n', n, ' inc', inc)

    if (rx < 0) throw new Error(`negative x radius: ${rx}`);
    if (ry < 0) throw new Error(`negative y radius: ${ry}`);

    for (var c = 0; c <= n; c++) {
      let i = c === n ? a1 : a0 + c * inc * cw

      let x0 = x - (ry * Math.sin(i)) * Math.sin(rot * Math.PI) + (rx * Math.cos(i)) * Math.cos(rot * Math.PI);
      let y0 = y + (rx * Math.cos(i)) * Math.sin(rot * Math.PI) + (ry * Math.sin(i)) * Math.cos(rot * Math.PI);

      // Is this path empty? Move to (x0,y0).
      if (!c) {
        if (this._x1 === null) {
          this.moveTo(x0, y0)
        }
        // Or, is (x0,y0) not coincident with the previous point? Line to (x0,y0).
        else if (Math.abs(this._x1 - x0) > epsilon || Math.abs(this._y1 - y0) > epsilon) {
          this.lineTo(x0, y0)
          continue
        }
      }

      this.lineTo(x0, y0)
    }
  }
  rect(x, y, w, h) {
    this.moveTo(x, y)
    this.lineTo(x + w, y)
    this.lineTo(x + w, y + h)
    this.lineTo(x, y + h)
    this.lineTo(x, y)
  }
  toString() {
    if (!this._.length) return ""
    return this._.map(d => d.join(" ")).join('\n')
  }
}

