const assert = require('assert')
const sinon = require('sinon')
const CanvasHpgl = require('../dist/index.umd')

describe('Hpgl', function () {

  it("hpgl.toString() returns empty string when no commands", function () {
    var p = new CanvasHpgl();
    assert.equal(p.toString(), "");
  })

  it("hpgl.toString() returns string of commands", function () {
    var p = new CanvasHpgl();
    assert.equal(p.toString(), "");
    p.moveTo(150, 50);
    assert.equal(p.toString(), "PU 150 -50;\n");
    p.lineTo(200, 100);
    assert.equal(p.toString(), "PU 150 -50;\nPD 200 -100;\n");
    p.moveTo(-200, -500);
    assert.equal(p.toString(), "PU 150 -50;\nPD 200 -100;\nPU -200 500;\n");
    p.lineTo(-300, 150);
    assert.equal(p.toString(), "PU 150 -50;\nPD 200 -100;\nPU -200 500;\nPD -300 -150;\n");
  })

  it("hpgl.beginPath() clears the buffer of commands", function () {
    var p = new CanvasHpgl();
    assert.equal(p.toString(), "");
    p.moveTo(150, 50);
    p.beginPath()
    assert.equal(p.toString(), "");
  })

  it("hpgl.moveTo(x, y) appends PU commands", function () {
    var p = new CanvasHpgl();
    p.moveTo(150, 50);
    assert.equal(p.toString(), "PU 150 -50;\n");
  });

  it("hpgl.moveTo(x, y) reduces multiple consecutive PU commands to the last one", function () {
    var p = new CanvasHpgl();
    p.moveTo(150, 50);
    assert.equal(p.toString(), "PU 150 -50;\n");
    p.moveTo(200, 100);
    assert.equal(p.toString(), "PU 200 -100;\n");
    p.moveTo(100, 50);
    assert.equal(p.toString(), "PU 100 -50;\n");
  });

  it("hpgl.moveTo(x, y) reduces multiple consecutive PD commands to same point with a single command", function () {
    var p = new CanvasHpgl();
    p.lineTo(150, 50);
    assert.equal(p.toString(), "PD 150 -50;\n");
    p.lineTo(150, 50);
    assert.equal(p.toString(), "PD 150 -50;\n");
    p.lineTo(150, 50);
    assert.equal(p.toString(), "PD 150 -50;\n");
  });

  it("hpgl.lineTo(x, y) appends PD commands", function () {
    var p = new CanvasHpgl();
    p.lineTo(150, 50);
    assert.equal(p.toString(), "PD 150 -50;\n");
    p.lineTo(200, 100);
    assert.equal(p.toString(), "PD 150 -50;\nPD 200 -100;\n");
    p.lineTo(100, 50);
    assert.equal(p.toString(), "PD 150 -50;\nPD 200 -100;\nPD 100 -50;\n");
  });

  it("hpgl.scale(x, y) scales commands", function () {
    var p = new CanvasHpgl();
    p.moveTo(0, 0);
    p.lineTo(100, 0);
    assert.equal(p.toString(), "PU 0 0;\nPD 100 0;\n");
    p.moveTo(0, 0);
    p.scale(2);
    p.lineTo(100, 0);
    assert.equal(p.toString(), "PU 0 0;\nPD 100 0;\nPU 0 0;\nPD 200 0;\n");
  });

  it("hpgl.resetTransform() removes the transforms commands", function () {
    var p = new CanvasHpgl();
    p.moveTo(0, 0);
    p.scale(2);
    p.lineTo(100, 0);
    assert.equal(p.toString(), "PU 0 0;\nPD 200 0;\n");
    p.resetTransform()
    p.moveTo(0, 0);
    p.lineTo(100, 0);
    assert.equal(p.toString(), "PU 0 0;\nPD 200 0;\nPU 0 0;\nPD 100 0;\n");
  });

})
