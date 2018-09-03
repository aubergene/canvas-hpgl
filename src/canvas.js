import bezier from 'adaptive-bezier-curve'
import { identity, rotate, scale, translate, fromObject, compose, applyToPoint, inverse } from 'transformation-matrix';

const pi = Math.PI,
  tau = 2 * pi,
  epsilon = 1e-6,
  tauEpsilon = tau - epsilon,
  radDeg = 180 / Math.PI,
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
    ({ x, y } = applyToPoint(this._matrix, { x, y }));
    this._x0 = this._x1 = +x
    this._y0 = this._y1 = +y
    this.ctx.forEach(c => c.moveTo(x, y))
  }
  lineTo(x, y) {
    ({ x, y } = applyToPoint(this._matrix, { x, y }));
    this._x1 = +x
    this._y1 = +y
    this.ctx.forEach(c => c.lineTo(x, y))
  }
  closePath() {
    if (this._x1 !== null) {
      this.lineTo(this._x1 = this._x0, this._y1 = this._y0)
    }
  }
  quadraticCurveTo(x1, y1, x, y) {
    const start = applyToPoint(inverse(this._matrix), { x: this._x0, y: this._y0 });
    const point = applyToPoint(this._matrix, { x, y });
    const points = bezier(
      [start.x, start.y],
      [x1, y1],
      [x1, y1],
      [+x, +y],
      +this._bezierScale
    )
    this._x0 = this._x1 = point.x
    this._y0 = this._y1 = point.y
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
    const r = (rx + ry) / 2
    const a = Math.abs(a1 - a0)
    const inc = (a / tau) / a / Math.sqrt(r / 100)
    const n = Math.ceil(a / inc)
    const cw = ccw ? -1 : 1

    if (rx < 0) throw new Error(`negative x radius: ${rx}`);
    if (ry < 0) throw new Error(`negative y radius: ${ry}`);

    for (var c = 0; c <= n; c++) {
      let i = c === n ? a1 : a0 + c * inc * cw

      let xPos = x - (rx * Math.sin(i)) * Math.sin(rot * Math.PI) + (ry * Math.cos(i)) * Math.cos(rot * Math.PI);
      let yPos = y + (ry * Math.cos(i)) * Math.sin(rot * Math.PI) + (rx * Math.sin(i)) * Math.cos(rot * Math.PI);

      // Is this path empty? Move to (x0,y0).
      if (!i && this._x1 === null) {
        this.moveTo(xPos, yPos)
      }

      this.lineTo(xPos, yPos)
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

