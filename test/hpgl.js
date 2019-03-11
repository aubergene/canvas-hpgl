const assert = require("assert");
const CanvasHpgl = require("../dist/canvas-hpgl.umd");

describe("Hpgl", function() {
  it("hpgl.toString() returns empty string when no commands", function() {
    var p = new CanvasHpgl();
    assert.equal(p.toString(), "");
  });

  it("hpgl.toString() returns string of commands", function() {
    var p = new CanvasHpgl();
    assert.equal(p.toString(), "");
    p.moveTo(150, 50);
    assert.equal(p.toString(), "PU 150 -50;\n");
    p.lineTo(200, 100);
    assert.equal(p.toString(), "PU 150 -50;\nPD 200 -100;\n");
    p.moveTo(-200, -500);
    assert.equal(p.toString(), "PU 150 -50;\nPD 200 -100;\nPU -200 500;\n");
    p.lineTo(-300, 150);
    assert.equal(
      p.toString(),
      "PU 150 -50;\nPD 200 -100;\nPU -200 500;\nPD -300 -150;\n"
    );
  });

  it("hpgl.beginPath() clears the buffer of commands", function() {
    var p = new CanvasHpgl();
    assert.equal(p.toString(), "");
    p.moveTo(150, 50);
    p.beginPath();
    assert.equal(p.toString(), "");
  });

  it("hpgl.moveTo(x, y) appends PU commands", function() {
    var p = new CanvasHpgl();
    p.moveTo(150, 50);
    assert.equal(p.toString(), "PU 150 -50;\n");
  });

  it("hpgl.moveTo(x, y) reduces multiple consecutive PU commands to the last one", function() {
    var p = new CanvasHpgl();
    p.moveTo(150, 50);
    assert.equal(p.toString(), "PU 150 -50;\n");
    p.moveTo(200, 100);
    assert.equal(p.toString(), "PU 200 -100;\n");
    p.moveTo(100, 50);
    assert.equal(p.toString(), "PU 100 -50;\n");
  });

  it("hpgl.moveTo(x, y) reduces multiple consecutive PD commands to same point with a single command", function() {
    var p = new CanvasHpgl();
    p.lineTo(150, 50);
    assert.equal(p.toString(), "PD 150 -50;\n");
    p.lineTo(150, 50);
    assert.equal(p.toString(), "PD 150 -50;\n");
    p.lineTo(150, 50);
    assert.equal(p.toString(), "PD 150 -50;\n");
  });

  it("hpgl.moveTo(x, y) ignores a PU command if we're already at that same", function() {
    var p = new CanvasHpgl();
    p.lineTo(150, 50);
    assert.equal(p.toString(), "PD 150 -50;\n");
    p.moveTo(150, 50);
    assert.equal(p.toString(), "PD 150 -50;\n");
  });

  it("hpgl.lineTo(x, y) appends PD commands", function() {
    var p = new CanvasHpgl();
    p.lineTo(150, 50);
    assert.equal(p.toString(), "PD 150 -50;\n");
    p.lineTo(200, 100);
    assert.equal(p.toString(), "PD 150 -50;\nPD 200 -100;\n");
    p.lineTo(100, 50);
    assert.equal(p.toString(), "PD 150 -50;\nPD 200 -100;\nPD 100 -50;\n");
  });

  it("hpgl.scale(x, y) scales commands", function() {
    var p = new CanvasHpgl();
    p.moveTo(0, 0);
    p.lineTo(100, 0);
    assert.equal(p.toString(), "PU 0 0;\nPD 100 0;\n");
    p.moveTo(0, 0);
    p.scale(2);
    p.lineTo(100, 0);
    assert.equal(p.toString(), "PU 0 0;\nPD 100 0;\nPU 0 0;\nPD 200 0;\n");
  });

  it("hpgl.resetTransform() removes the transforms commands", function() {
    var p = new CanvasHpgl();
    p.moveTo(0, 0);
    p.scale(2);
    p.lineTo(100, 0);
    assert.equal(p.toString(), "PU 0 0;\nPD 200 0;\n");
    p.resetTransform();
    p.moveTo(0, 0);
    p.lineTo(100, 0);
    assert.equal(p.toString(), "PU 0 0;\nPD 200 0;\nPU 0 0;\nPD 100 0;\n");
  });

  it("hpgl.strokeStyle sets pen 1 (SP 1) when given unknown color", function() {
    var p = new CanvasHpgl();
    p.strokeStyle = "#f90";
    assert.equal(p.toString(), "SP 1;\n");
  });

  it("hpgl.strokeStyle sets pen from penColors", function() {
    var p = new CanvasHpgl({
      penColors: {
        "#000": 1,
        "#C00": 2,
        "#0C0": 3,
        "#00C": 4,
        "rgb(0,255,0)": 3
      }
    });
    p.strokeStyle = "#000";
    p.strokeStyle = "#00C";
    p.strokeStyle = "#0C0";
    p.strokeStyle = "#C00";
    p.strokeStyle = "rgb(0,255,0)";
    assert.equal(p.toString(), "SP 1;\nSP 4;\nSP 3;\nSP 2;\nSP 3;\n");
  });

  it("hpgl.strokeStyle returns the last color set", function() {
    var p = new CanvasHpgl();
    p.strokeStyle = "rgb(0,255,0)";
    assert.equal(p.strokeStyle, "rgb(0,255,0)");
  });
});
