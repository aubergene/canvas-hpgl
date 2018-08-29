const assert = require('assert')
const sinon = require('sinon')
const { Canvas } = require('../dist/index.umd')

describe('straightCanvas.Canvas', function () {
  const moveTo = sinon.spy()
  const lineTo = sinon.spy()
  const ctx = { moveTo, lineTo }
  var sc

  beforeEach(function () {
    moveTo.resetHistory()
    lineTo.resetHistory()
    sc = new Canvas(ctx)
  });

  it('moveTo', function() {
    sc.moveTo(0, 0)
    assert(moveTo.called)
  })

  it('lineTo', function() {
    sc.lineTo(0, 0)
    assert(lineTo.called)
  })

  it("closePath", function () {
    sc.moveTo(150, 50);
    assert.equal(moveTo.callCount, 1)
    assert.equal(lineTo.callCount, 0)
    sc.closePath();
    assert.equal(moveTo.callCount, 1)
    assert.equal(lineTo.callCount, 1)
    sc.lineTo(250, 150);
    sc.closePath();
    assert.equal(moveTo.callCount, 1)
    assert.equal(lineTo.callCount, 3)
  });

  it('rect', function() {
    sc.rect(0, 0, 100, 200)
    assert.equal(moveTo.callCount, 1)
    assert.equal(lineTo.callCount, 4)
  })

  it('quadraticCurveTo', function() {
    sc.quadraticCurveTo(100, 50, 200, 100);
    assert.equal(moveTo.callCount, 0)
    assert.equal(lineTo.callCount, 14)
  })

  it('bezierCurveTo', function() {
    sc.bezierCurveTo(100, 50, 0, 24, 200, 100);
    assert.equal(moveTo.callCount, 0)
    assert.equal(lineTo.callCount, 15)
  })

})
