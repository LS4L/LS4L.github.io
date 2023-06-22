import { unitAdd } from "./units.js";
import { primLoadObj } from "../rnd/prims.js";
import { matr4, vec3 } from "../utils/mth.js";
import { cam } from "../utils/controls.js";
import { users, gl } from "../main.js";

let primitive;
let myMatr4 = new matr4();
let success = 1;
let side = new vec3(0, 0, -1);
let placesHTML;
function render() {
  if (success) {
    primitive.draw(
      myMatr4
        .rotateY((side.angle(cam.userDir) * 180) / Math.PI)
        .mul(myMatr4.translate(new vec3(cam.userLoc.x, 0, cam.userLoc.z)))
    );
  }

  for (let userCam of users) {
    if (userCam != null && cam.id != userCam.id) {
      let world = myMatr4
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
        );
      primitive.draw(world);

      let clipspace = new vec3(
        userCam.userLoc.x,
        userCam.userLoc.y,
        userCam.userLoc.z
      );

      if (
        cam.userDir.angle(clipspace.sub(cam.loc)) > 1.57 ||
        cam.userDir.angle(clipspace.sub(cam.loc)) < -1.57
      )
        continue;

      clipspace = clipspace.mulMatr(cam.matrView).mulMatr(cam.matrProj);

      let pixelX = (clipspace.x * 0.5 + 0.5) * gl.canvas.width;
      let pixelY = (clipspace.y * -0.5 + 0.5) * gl.canvas.height;

      let placeTag = document.createElement("span");
      const nameTag = document.createTextNode(userCam.userName);
      placeTag.appendChild(nameTag);

      placeTag.className = "place";
      placeTag.style.left = Math.floor(pixelX) + "px";
      placeTag.style.top = Math.floor(pixelY) + "px";
      placeTag.style.position = "absolute";
      placeTag.style.fontSize = "24px";
      placeTag.style.color = "green";
      placeTag.style.fontFamily = "impact";
      placeTag.style.backgroundColor = "black";
      placeTag.style.borderRadius = "10px";
      placeTag.style.paddingRight = placeTag.style.paddingLeft = "3px";
      placesHTML.appendChild(placeTag);
    }
  }
}
async function init() {
  let obj;
  placesHTML = document.getElementById("places");

  primitive = await primLoadObj(obj);
  primitive.catch(() => (success = 0));

  primitive.mtl.shaderName = "withLightSmooth";
  await primitive.create();
}

export function unitBikeAdd() {
  unitAdd(init, render, "user");
}
