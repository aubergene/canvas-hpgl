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
  arcTo(x1, y1, x2, y2, r) {
    x1 = +x1, y1 = +y1, x2 = +x2, y2 = +y2, r = +r;
    var x0 = this._x1,
      y0 = this._y1,
      x21 = x2 - x1,
      y21 = y2 - y1,
      x01 = x0 - x1,
      y01 = y0 - y1,
      l01_2 = x01 * x01 + y01 * y01;

    // Is the radius negative? Error.
    if (r < 0) throw new Error("negative radius: " + r);

    // Is this path empty? Move to (x1,y1).
    if (this._x1 === null) {
      this.moveTo(x1, y1)
    }

    // Or, is (x1,y1) coincident with (x0,y0)? Do nothing.
    else if (!(l01_2 > epsilon));

    // Or, are (x0,y0), (x1,y1) and (x2,y2) collinear?
    // Equivalently, is (x1,y1) coincident with (x2,y2)?
    // Or, is the radius zero? Line to (x1,y1).
    else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon) || !r) {
      // this._ += "L" + (this._x1 = x1) + "," + (this._y1 = y1);
      this.lineTo(x1, y1)
    }

    // Otherwise, draw an arc!
    else {
      var x20 = x2 - x0,
        y20 = y2 - y0,
        l21_2 = x21 * x21 + y21 * y21,
        l20_2 = x20 * x20 + y20 * y20,
        l21 = Math.sqrt(l21_2),
        l01 = Math.sqrt(l01_2),
        l = r * Math.tan((pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),
        t01 = l / l01,
        t21 = l / l21;

      // If the start tangent is not coincident with (x0,y0), line to.
      if (Math.abs(t01 - 1) > epsilon) {
        // this._ += "L" + (x1 + t01 * x01) + "," + (y1 + t01 * y01);
        this.lineTo(x1 + t01 * x01, y1 + t01 * y01)
      }

      const x3 = (x1 + t21 * x21)
      const y3 = (y1 + t21 * y21)

      const h = Math.hypot(x3 - this._x1, y3 - this._y1)
      const a = Math.asin(h / 2 / r) * 2

      const x4 = (this._x1 + x3) / 2
      const y4 = (this._y1 + y3) / 2

      const basex = Math.sqrt((r * r) - (Math.pow(h / 2, 2))) * (y3 - this._y1) / h
      const basey = Math.sqrt((r * r) - (Math.pow(h / 2, 2))) * (this._x1 - x3) / h

      const startAngle = Math.atan2(this._y1 - y4 + basey, this._x1 - x4 + basex)
      this.arc(x4 - basex, y4 - basey, r, startAngle, startAngle + a)
    }
  }
  ellipse(x, y, rx, ry, rot, a0, a1, ccw) {
    if (a0 < 0) a0 = (a0 + tau) % tau
    if (a1 < 0) a1 = (a1 + tau) % tau

    const maxR = Math.max(rx, ry)

    let a = ccw ? a0 - a1 : a1 - a0
    if (a < 0) a = (a + tau) % tau
    const inc = 1 / Math.sqrt(maxR * this._arcScale - (Math.pow(this._arcScale, 2)))
    const n = Math.ceil(a / inc)
    const cw = ccw ? -1 : 1

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

