import { unitCubeAdd } from "./unitCube.js";
import { unitTetrAdd } from "./unitTetrahedron.js";
import { unitOctaAdd } from "./unitOctahedron.js";
import { unitIcoAdd } from "./unitIcosahedron.js";
import { unitMrkAdd } from "../utils/markers.js";
import { unitDbgAdd } from "./unitDbg.js";
import { unitMarkersAdd } from "./unitmarker.js";
import { unitObjAdd } from "./unitObj.js";
import { unitPlaneAdd } from "./unitPlane.js";
import { unitDodeAdd } from "./unitDodecahedron.js";
import { unitCowAdd } from "./unitCow.js";
import { unitUserAdd } from "./unitUser.js";
import { unitFractalSkyAdd } from "./unitFractalSky.js";
export class unit {
  constructor(init, render) {
    this.init = init;
    this.render = render;
  }
}
let units = [];

export async function init() {
  unitFractalSkyAdd();
  /*
    unitCubeAdd();
    unitTetrAdd();
    unitOctaAdd();

  
    unitDodeAdd();*/
  unitCowAdd();
  //unitPlaneAdd();
  unitIcoAdd();
  //unitMrkAdd();
  unitUserAdd();
  unitObjAdd();
  //unitMarkersAdd();
  // unitDbgAdd();

  for (let i = 0; i < units.length; i++) {
    await units[i].init();
  }
}

export function render() {
  units.forEach((unit) => {
    unit.render();
  });
}

export function unitAdd(init, render) {
  units.push(new unit(init, render));
}
