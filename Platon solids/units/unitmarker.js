import { unitAdd } from "./units.js";
import { vec3, vec4 } from "../utils/mth.js";
import { marker } from "../utils/markers.js";

function render() {
    let mrk = new marker(
        new vec3(0, 10, 5),
        new vec3(10, 10, 10),
        0.5,
        new vec4(0.5, 0, 0.3, 1)
    );
    let mrk2 = new marker(
        new vec3(10, 10, 5),
        new vec3(10, 10, 10),
        0.5,
        new vec4(0.5, 0, 0.3, 1)
    );
}
async function init() {}
export function unitMarkersAdd() {
    unitAdd(init, render);
}
