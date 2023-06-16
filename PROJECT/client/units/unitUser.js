import { unitAdd } from "./units.js";
import { primLoadObj } from "../rnd/prims.js";
import { matr4, vec3 } from "../utils/mth.js";
import { cam } from "../utils/controls.js";
import { users } from "../main.js";

let primitive;
let myMatr4 = new matr4();
let success = 1;
let side = new vec3(-1, 0, 0);
function render() {
  if (success) {
    primitive.draw(
      myMatr4
        .rotateY((side.angle(cam.right) * 180) / Math.PI)
        .mul(myMatr4.scale(new vec3(1, 1, 1)))
        .mul(myMatr4.translate(new vec3(cam.userLoc.x, 0, cam.userLoc.z)))
    );
  }
  for (let userCam of users) {
    if (userCam != null && cam.id != userCam.id)
      primitive.draw(
        myMatr4
          .rotateY(
            (side.angle(
              new vec3(userCam.right.x, userCam.right.y, userCam.right.z)
            ) *
              180) /
              Math.PI
          )
          .mul(myMatr4.scale(new vec3(1, 1, 1)))
          .mul(
            myMatr4.translate(new vec3(userCam.userLoc.x, 0, userCam.userLoc.z))
          )
      );
  }
}
async function init() {
  let obj;

  await fetch(`bin/models/me1.obj`)
    .then((res) => res.text())
    .then((data) => {
      obj = data;
    })
    .catch(() => (success = 0));

  primitive = await primLoadObj(obj);
  primitive.mtl.shaderName = "withLightSmooth";
  await primitive.create();
}
export function unitUserAdd() {
  unitAdd(init, render);
}
