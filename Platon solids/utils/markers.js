import { gl } from "../main.js";
import { unitAdd } from "../units/units.js";
import { matr4, vec3, vec4 } from "../utils/mth.js";
import { cam } from "../utils/controls.js";
import { shaderAdd, useShader } from "../rnd/shaders.js";

const cubeVertexPositions = new Float32Array([
    1, 2, -1, 1, 2, 1, 1, 0, 1, 1, 0, -1, -1, 2, 1, -1, 2, -1, -1, 0, -1, -1, 0,
    1, -1, 2, 1, 1, 2, 1, 1, 2, -1, -1, 2, -1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1,
    0, 1, 1, 2, 1, -1, 2, 1, -1, 0, 1, 1, 0, 1, -1, 2, -1, 1, 2, -1, 1, 0, -1,
    -1, 0, -1,
]);

const cubeVertexIndices = new Uint16Array([
    0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14,
    15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23,
]);

let markers = [];
let worldLoc;
let colorLoc;
let cubeVertexArray;
let shaderI;
function render() {
    gl.useProgram(shaderI.shaderProgram);

    const projectionLoc = gl.getUniformLocation(
        shaderI.shaderProgram,
        "projection"
    );
    const modelViewLoc = gl.getUniformLocation(
        shaderI.shaderProgram,
        "modelView"
    );
    worldLoc = gl.getUniformLocation(shaderI.shaderProgram, "world");
    colorLoc = gl.getUniformLocation(shaderI.shaderProgram, "color");
    gl.bindVertexArray(cubeVertexArray);
    gl.uniformMatrix4fv(
        projectionLoc,
        false,
        new Float32Array(cam.matrProj.a().join().split(","))
    );
    let myMatr4 = new matr4();
    gl.uniformMatrix4fv(
        worldLoc,
        false,
        new Float32Array(myMatr4.a().join().split(","))
    );
    gl.uniformMatrix4fv(
        modelViewLoc,
        false,
        new Float32Array(cam.matrView.a().join().split(","))
    );

    markers.forEach((it) => it.render());
}

export class marker {
    constructor(
        start = new vec3(0),
        end = new vec3(100),
        width = 0.1,
        color = new vec4(1, 0, 1, 1)
    ) {
        this.start = start;
        this.end = end;
        this.width = width;
        this.color = color;
        markers.push(this);
    }
    render() {
        let myMatr4 = new matr4();
        let up = new vec3(0, 1, 0);
        let centered = this.end.sub(this.start);
        gl.uniformMatrix4fv(
            worldLoc,
            false,
            new Float32Array(
                myMatr4
                    .scale(
                        new vec3(
                            this.width,
                            this.end.sub(this.start).len(),
                            this.width
                        )
                    )
                    .mul(
                        myMatr4.rotateX(
                            up.angle(new vec3(0, centered.y, centered.z))
                        )
                    )
                    .mul(
                        myMatr4.rotateY(
                            up.angle(new vec3(centered.x, 0, centered.z)) + 90
                        )
                    )
                    .mul(myMatr4.translate(this.start)) /* Stopped */
                    .a()
                    .join()
                    .split(",")
            )
        );
        gl.uniform4f(
            colorLoc,
            this.color.x,
            this.color.y,
            this.color.z,
            this.color.w
        );

        gl.drawElements(
            gl.TRIANGLES,
            36, // num vertices to process
            gl.UNSIGNED_SHORT, // type of indices
            0 // offset on bytes to indices
        );
    }
}

async function init() {
    /* Tetr */
    markers = [];
    shaderI = await shaderAdd("markers");
    cubeVertexArray = gl.createVertexArray();
    gl.bindVertexArray(cubeVertexArray);
    useShader(shaderI, cubeVertexPositions, cubeVertexIndices);
    gl.bindVertexArray(null);
    //gl.bindVertexArray(markVertexArray);
    /* aaa */
}

export function unitMrkAdd() {
    unitAdd(init, render);
}
