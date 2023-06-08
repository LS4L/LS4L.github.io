import { gl } from "./main.js";
import { unitAdd } from "./units.js";
import { shaderAdd } from "./shaders.js";
import { mouse, isPause } from "./controls.js";

const canvas = document.getElementById("glCanvas");

let pos = [];
let posLoc;
let shaderProgram;
const rcoeff = document.getElementById("rcoeff");
const gcoeff = document.getElementById("gcoeff");
const bcoeff = document.getElementById("bcoeff");
const a = document.getElementById("a");
const b = document.getElementById("b");
function render() {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0); //posloc
    let timeLoc = gl.getUniformLocation(shaderProgram.shaderProgram, "time");
    let xLoc = gl.getUniformLocation(shaderProgram.shaderProgram, "x");
    let yLoc = gl.getUniformLocation(shaderProgram.shaderProgram, "y");
    let zoom = gl.getUniformLocation(shaderProgram.shaderProgram, "zoom");
    let rcoeffLoc = gl.getUniformLocation(
        shaderProgram.shaderProgram,
        "rcoeff"
    );
    let gcoeffLoc = gl.getUniformLocation(
        shaderProgram.shaderProgram,
        "gcoeff"
    );
    let bcoeffLoc = gl.getUniformLocation(
        shaderProgram.shaderProgram,
        "bcoeff"
    );
    let aLoc = gl.getUniformLocation(shaderProgram.shaderProgram, "a");
    let bLoc = gl.getUniformLocation(shaderProgram.shaderProgram, "b");
    gl.uniform1f(timeLoc, isPause ? 100 : Date.now());
    gl.uniform1f(yLoc, mouse.x / canvas.width);
    gl.uniform1f(xLoc, mouse.y / canvas.height);
    gl.uniform1f(zoom, mouse.zoom);
    gl.uniform1f(rcoeffLoc, rcoeff.value);
    gl.uniform1f(gcoeffLoc, gcoeff.value);
    gl.uniform1f(bcoeffLoc, bcoeff.value);
    gl.uniform1f(aLoc, a.value);
    gl.uniform1f(bLoc, b.value);
    gl.useProgram(shaderProgram.shaderProgram);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
async function init() {
    /* Tetr */
    shaderProgram = await shaderAdd("mandelbrot");
    pos = [-1, -1, -1, 1, 1, -1, 1, 1];
    gl.bindVertexArray(null);
    /* aaa */
}
export function unitFracAdd() {
    unitAdd(init, render);
}
