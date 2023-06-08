import { gl } from "./main.js";
import { unitAdd } from "./units.js";
import { cam } from "./controls.js";
import { matr4, vec3 } from "./mth.js";
import { shaderAdd, useShader } from "./shaders.js";
import { primitives } from "./prims.js";
function render() {
    primitives.forEach((it) => it.draw(new matr4()));
}
async function init() {}
export function unitObjAdd() {
    unitAdd(init, render);
}
