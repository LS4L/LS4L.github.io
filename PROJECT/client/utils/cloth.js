import { vec3, vec4, matr4 } from "../utils/mth.js";
import { keys, isPause } from "../utils/controls.js";
import { drawMarker } from "../utils/markers.js";

/*

export function getPointSpherePenetrationPoints(Point, c, r, Q )
{
  if (Point.sub(C).len2() > r * r)
    return null;
 return c.add(Point.sub(C).mul(R / point.sub(C).len()));
}

export function getPointCirclePenetrationPoints(Point, c, r, Q )
{
  if (((new vec2(Point.X, point.Z)).sub(new vec2(C.X, c.Z)).len2() > r * r) || point.Y > c.Y || point.Y < c.Y - 1)
    return null;

  return new vec3(Point.X, c.Y, point.Z);
}
*/
let deltaTime = 4;
export let numIterations = 5;

export class cloth {
  constructor() {
    this.w = 0;
    this.h = 0;
    this.numOfConstraints = 0;
    this.constraints = [];
    this.p = [];
    this.oldP = [];
    this.forces = [];
    this.weight = 0;
    this.friction = 0;
    this.stiffness = 0;
    this.handleCollisions = null;
    this.handleHardConstraints = null;
  }

  createDefault(width, height, weight, friction, stiffness) {
    this.w = width;
    this.h = height;
    this.weight = weight;
    this.friction = friction;
    this.stiffness = stiffness;

    // cloth constraints
    let p = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (x < width - 1) {
          this.constraints[p] = {
            particleA: y * width + x,
            particleB: y * width + (x + 1),
            restLength: 1,
            damper: 0,
            stretch: new vec3(),
          };
          p++;
        }
        if (y < height - 1) {
          this.constraints[p] = {
            particleA: y * width + x,
            particleB: (y + 1) * width + x,
            restLength: 1,
            damper: 0,
            stretch: new vec3(),
          };
          p++;
        }
      }
    }
    this.numOfConstraints = p;

    // cloth particle positions
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pos = new vec3(x, 0, y);
        this.p[y * width + x] = pos;
        this.oldP[y * width + x] = vec3.clone(pos);
      }
    }
  }

  accumulateForces() {
    for (let i = 0; i < this.w * this.h; i++) {
      this.forces[i] = new vec3(0, -this.weight, 0);
    }
  }

  verletStep() {
    for (let i = 0; i < this.w * this.h; i++) {
      const oldPos = vec3.clone(this.p[i]);
      const newPos = new vec3();
      vec3.add(
        newPos,
        this.p[i],
        vec3.sub(new vec3(), this.p[i], this.oldP[i])
      );
      vec3.mul(newPos, newPos, this.friction);
      vec3.add(newPos, newPos, vec3.mul(new vec3(), this.forces[i], deltaTime));
      this.p[i] = newPos;
      this.oldP[i] = oldPos;
    }
  }

  satisfyConstraints() {
    for (let iteration = 0; iteration < numIterations; iteration++) {
      if (this.handleCollisions !== null) {
        this.handleCollisions(this);
      }

      for (let i = 0; i < this.numOfConstraints; i++) {
        const constraint = this.constraints[i];
        const delta = vec3.sub(
          new vec3(),
          this.p[constraint.particleB],
          this.p[constraint.particleA]
        );
        const deltaLength2 = vec3.lengthSq(delta);

        if (
          deltaLength2 > constraint.restLength * constraint.restLength * 1.1 &&
          keys["T".charCodeAt(0)]
        ) {
          const stiffnessFactor =
            (deltaLength2 - constraint.restLength * constraint.restLength) /
              (deltaLength2 +
                (constraint.restLength - constraint.damper) *
                  (constraint.restLength - constraint.damper)) -
            0.5;
          const deltaFactor = vec3.mul(new vec3(), delta, stiffnessFactor);

          constraint.stretch = deltaFactor;

          vec3.sub(
            this.p[constraint.particleA],
            this.p[constraint.particleA],
            deltaFactor
          );
          vec3.add(
            this.p[constraint.particleB],
            this.p[constraint.particleB],
            deltaFactor
          );
        } else {
          constraint.stretch = new vec3(0, 1, 0);
        }
      }
    }

    if (this.handleHardConstraints !== null) {
      this.handleHardConstraints(this);
    }
  }

  update(speed) {
    if (!isPause) {
      for (let i = 0; i < speed; i++) {
        this.accumulateForces();
        this.verletStep();
        this.satisfyConstraints();
      }
    }
  }

  draw() {
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        drawMarker(
          this.p[this.constraints[y * this.w + x].particleA],
          0.3,
          this.p[this.constraints[y * this.w + x].particleB],
          0.3,
          vec4.scale(
            vec4.create(),
            this.constraints[y * this.w + x].stretch,
            80
          ),
          new matr4()
        );
      }
    }

    for (let y = 0; y < this.h - 1; y++) {
      for (let x = 0; x < this.w; x++) {
        const constraint =
          this.constraints[this.h * (this.w - 1) + y * this.w + x];
        const stretch = constraint.stretch;
        const color = vec4.fromValues(
          1 - stretch[0] * 80,
          1 - stretch[1] * 80,
          1 - stretch[2] * 80,
          1
        );

        drawMarker(
          this.p[constraint.particleA],
          0.1,
          this.p[constraint.particleB],
          0.1,
          color,
          new matr4()
        );
      }
    }
  }
}
