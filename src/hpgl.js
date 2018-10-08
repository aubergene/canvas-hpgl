import { identity, rotate, scale, translate, fromObject, compose, applyToPoint } from 'transformation-matrix';

const round = Math.round

export class Hpgl {
  constructor() {
    this.beginPath()
    this.resetTransform()
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

  beginPath() {
    this._ = []
    this._x0 = this._y0 = null; // start of current subpath
    this._x1 = this._y1 = null; // end of current subpath
  }

  moveTo(x, y) {
    y *= -1;
    ({ x, y } = applyToPoint(this._matrix, { x, y }));
    this._cmd('PU', round(this._x0 = this._x1 = +x), round(this._y0 = this._y1 = +y))
  }
  lineTo(x, y) {
    y *= -1;
    ({ x, y } = applyToPoint(this._matrix, { x, y }));
    this._cmd('PD', round(this._x1 = +x), round(this._y1 = +y));
  }
  toString() {
    if (!this._.length) return ""
    return this._.map(d => d.join(' ')).join(';\n') + ';\n'
  }

  _cmd(cmd, ...params) {
    params = params.join(' ')
    if (this._.length) {
      const prevCmd = this._[this._.length-1]
      if (prevCmd[0] === cmd) {
        if (prevCmd[0] === 'PU') {
          // Replace previous move commands with the new one
          // to remove long lists of pointless consecutive moves
          this._.pop()
        } else if (prevCmd[1] === params) {
          // Don't draw to the same point more than once
          return
        }
      }
    }
    this._.push([cmd, params])
  }
}
