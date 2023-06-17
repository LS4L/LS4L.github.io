import { gl } from "../main.js";
import { unitAdd } from "./units.js";
import { cam } from "../utils/controls.js";
import { matr4, vec3 } from "../utils/mth.js";
import { shaderAdd, useShader } from "../rnd/shaders.js";

let size = 10;
const planeVertexPositions = new Float32Array([
  size / 2,
  0,
  size / 2,

  -size / 2,
  0,
  size / 2,

  size / 2,
  0,
  -size / 2,

  size / 2,
  0,
  -size / 2,

  -size / 2,
  0,
  size / 2,

  -size / 2,
  0,
  -size / 2,
]);

const mapVertexTexcoords = new Float32Array([
  1, 1, 0, 1, 1, 0,

  1, 0, 0, 1, 0, 0,
]);

let tileVA;
let shaderI;
let tiles = [];
let zoom = 1;
let oldUserLoc = new vec3(0, 1000, 0);
let maxRenderLength = 3;
let maxRenderLength2 = maxRenderLength * maxRenderLength;

class tile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  async load() {
    let tileset_id = "mapbox.satellite";
    let access_token =
      "pk.eyJ1IjoiYWxla3NlaS1hLXIiLCJhIjoiY2xpeWNkbDZ0MGd4bjNkbzFxYzZzOTRjaSJ9.OTXez9jXEokdDh5WEL8lIQ";
    access_token =
      "pk.eyJ1IjoibHM0IiwiYSI6ImNsaXluYmYyODA1bnAzcXQ4amlweGowc3gifQ.6cQiQQxsiO3WUIbKFOQrmw";
    let format = "png";
    let x = 0;
    let y = 0;

    let url = `https://api.mapbox.com/v4/${tileset_id}/${zoom}/${x}/${y}.${format}?access_token=${access_token}`;
    /* fetches for a location */
    let response = await fetch(url);
    if (response.ok) {
      let blob = await response.blob();
      let imageBM = await createImageBitmap(blob);

      this.texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0, // mip level
        gl.RGBA, // internal format
        imageBM.width, // width
        imageBM.height, // height
        0, // border
        gl.RGBA, // format
        gl.UNSIGNED_BYTE, // type
        imageBM // data
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    } else {
      alert("HTTP error: " + response.status);
    }
    return this;
  }
}

function reloadTiles() {
  /* Delete the too faraway ones */
  tiles = tiles.filter(
    (tile) =>
      (tile.x - cam.userBlockPos.x) * (tile.x - cam.userBlockPos.x) +
        (tile.y - cam.userBlockPos.y) * (tile.y - cam.userBlockPos.y) <
      maxRenderLength2
  );

  /* load all the near and unloaded yet */
  cam.userBlockPos = new vec3(
    Math.floor(cam.userLoc.x / size),
    0,
    Math.floor(cam.userLoc.z / size)
  );

  for (let x = -maxRenderLength; x < maxRenderLength; x++)
    for (let y = -maxRenderLength; y < maxRenderLength; y++)
      if (x * x + y * y < maxRenderLength2)
        if (
          !tiles.find(
            (tile) =>
              tile.x == x + cam.userBlockPos.x &&
              tile.y == y + cam.userBlockPos.y
          )
        ) {
          let newTile = new tile(
            x + cam.userBlockPos.x,
            y + cam.userBlockPos.y
          );
          newTile.load().then((it) => tiles.push(it));
        }
}

function render() {
  gl.useProgram(shaderI.shaderProgram);
  let timeLoc = gl.getUniformLocation(shaderI.shaderProgram, "time");
  const projectionLoc = gl.getUniformLocation(
    shaderI.shaderProgram,
    "projection"
  );
  const modelViewLoc = gl.getUniformLocation(
    shaderI.shaderProgram,
    "modelView"
  );
  const worldLoc = gl.getUniformLocation(shaderI.shaderProgram, "world");
  //  draw dode
  gl.bindVertexArray(tileVA);
  gl.uniformMatrix4fv(
    projectionLoc,
    false,
    new Float32Array(cam.matrProj.a().join().split(","))
  );
  gl.uniformMatrix4fv(
    modelViewLoc,
    false,
    new Float32Array(cam.matrView.a().join().split(","))
  );
  let myMatr4 = new matr4();

  const camLocLoc = gl.getUniformLocation(shaderI.shaderProgram, "camLoc");
  const lightDirLoc = gl.getUniformLocation(shaderI.shaderProgram, "lightDir");

  gl.uniform3f(lightDirLoc, 1, 1, 1);
  gl.uniform3f(camLocLoc, cam.loc.x, cam.loc.y, cam.loc.z);
  /* Customiseable stuff */

  const kaLoc = gl.getUniformLocation(shaderI.shaderProgram, "ka");
  const kdLoc = gl.getUniformLocation(shaderI.shaderProgram, "kd");
  const ksLoc = gl.getUniformLocation(shaderI.shaderProgram, "ks");
  const phLoc = gl.getUniformLocation(shaderI.shaderProgram, "ph");
  gl.uniform3f(kaLoc, 0.01, 0.3, 0.1);
  gl.uniform3f(kdLoc, 0.07568, 0.61424, 0.07568);
  gl.uniform3f(ksLoc, 0.633, 0.727811, 0.633);
  gl.uniform1f(phLoc, 76.8);

  gl.uniform1f(timeLoc, Date.now());

  if (oldUserLoc.sub(cam.userLoc).len2() > 1 /*size*/) {
    reloadTiles();
  }

  const texLoc = gl.getUniformLocation(shaderI.shaderProgram, "tex0");
  let texUnit = 0;

  for (let i = 0; i < tiles.length; i++) {
    /* Pass position */
    gl.uniformMatrix4fv(
      worldLoc,
      false,
      new Float32Array(
        myMatr4
          .translate(
            new vec3(
              tiles[i].x + cam.userBlockPos.x,
              0,
              tiles[i].y + cam.userBlockPos.y
            )
          )
          .a()
          .join()
          .split(",")
      )
    );

    /* Bind texture */
    gl.activeTexture(gl.TEXTURE0 + texUnit);
    gl.bindTexture(gl.TEXTURE_2D, tiles[i].texture);
    gl.uniform1i(texLoc, texUnit);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}

async function init() {
  shaderI = await shaderAdd("map");
  tileVA = gl.createVertexArray();
  gl.bindVertexArray(tileVA);
  useShader(shaderI, planeVertexPositions);

  const texcoordLoc = gl.getAttribLocation(shaderI.shaderProgram, "texCoord");
  const texcoordBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, mapVertexTexcoords, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(texcoordLoc);
  gl.vertexAttribPointer(
    texcoordLoc, // location
    2, // size (components per iteration)
    gl.FLOAT, // type of to get from buffer
    false, // normalize
    0, // stride (bytes to advance each iteration)
    0 // offset (bytes from start of buffer)
  );
  gl.bindVertexArray(null);
  /* aaa */
  cam.userBlockPos = new vec3(
    Math.floor(cam.userLoc.x / size),
    0,
    Math.floor(cam.userLoc.z / size)
  );
}

export function unitMapAdd() {
  unitAdd(init, render);
}
