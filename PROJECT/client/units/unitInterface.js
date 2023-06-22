import { unitAdd } from "./units.js";
import { vec3 } from "../utils/mth.js";
import { cam } from "../utils/controls.js";

function render() {
  document.getElementById("infoButton").onclick = () => {
    document.getElementById("info").style.visibility =
      document.getElementById("info").style.visibility == "visible"
        ? "hidden"
        : "visible";
  };
  document.getElementById("info").style.color = "black";

  let north = new vec3(0, 0, -1);
  document.getElementById("compassBox").style.backgroundPosition =
    (north.angle(new vec3(cam.dir.x, 0, cam.dir.z)) * 1800) / Math.PI +
    400 +
    "px 0px";
}

async function init() {}
export function unitInterfaceAdd() {
  unitAdd(init, render, "Interface");
}
