class Cloth {
  constructor() {
    this.W = 0;
    this.H = 0;
    this.NumOfConstraints = 0;
    this.Constraints = [];
    this.P = [];
    this.OldP = [];
    this.Forces = [];
    this.Weight = 0;
    this.Friction = 0;
    this.Stiffness = 0;
    this.HandleCollisions = null;
    this.HandleHardConstraints = null;
  }

  createDefault(width, height, weight, friction, stiffness) {
    this.W = width;
    this.H = height;
    this.Weight = weight;
    this.Friction = friction;
    this.Stiffness = stiffness;

    // Cloth constraints
    let p = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (x < width - 1) {
          this.Constraints[p] = {
            ParticleA: y * width + x,
            ParticleB: y * width + (x + 1),
            RestLength: 1,
            Damper: 0,
            Stretch: vec3.create(),
          };
          p++;
        }
        if (y < height - 1) {
          this.Constraints[p] = {
            ParticleA: y * width + x,
            ParticleB: (y + 1) * width + x,
            RestLength: 1,
            Damper: 0,
            Stretch: vec3.create(),
          };
          p++;
        }
      }
    }
    this.NumOfConstraints = p;

    // Cloth particle positions
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pos = vec3.fromValues(x, 0, y);
        this.P[y * width + x] = pos;
        this.OldP[y * width + x] = vec3.clone(pos);
      }
    }
  }

  accumulateForces() {
    for (let i = 0; i < this.W * this.H; i++) {
      this.Forces[i] = vec3.fromValues(0, -this.Weight, 0);
    }
  }

  verletStep() {
    for (let i = 0; i < this.W * this.H; i++) {
      const oldPos = vec3.clone(this.P[i]);
      const newPos = vec3.create();
      vec3.add(newPos, this.P[i], vec3.sub(vec3.create(), this.P[i], this.OldP[i]));
      vec3.scale(newPos, newPos, this.Friction);
      vec3.add(newPos, newPos, vec3.scale(vec3.create(), this.Forces[i], deltaTime));
      this.P[i] = newPos;
      this.OldP[i] = oldPos;
    }
  }

  satisfyConstraints() {
    for (let iteration = 0; iteration < numIterations; iteration++) {
      if (this.HandleCollisions !== null) {
        this.HandleCollisions(this);
      }

      for (let i = 0; i < this.NumOfConstraints; i++) {
        const constraint = this.Constraints[i];
        const delta = vec3.sub(vec3.create(), this.P[constraint.ParticleB], this.P[constraint.ParticleA]);
        const deltaLength2 = vec3.lengthSq(delta);

        if (deltaLength2 > constraint.RestLength * constraint.RestLength * 1.1 && Ttp.Keys['T'.charCodeAt(0)]) {
          const stiffnessFactor =
            (deltaLength2 - constraint.RestLength * constraint.RestLength) /
            (deltaLength2 + (constraint.RestLength - constraint.Damper) * (constraint.RestLength - constraint.Damper)) -
            0.5;
          const deltaFactor = vec3.scale(vec3.create(), delta, stiffnessFactor);

          constraint.Stretch = deltaFactor;

          vec3.sub(this.P[constraint.ParticleA], this.P[constraint.ParticleA], deltaFactor);
          vec3.add(this.P[constraint.ParticleB], this.P[constraint.ParticleB], deltaFactor);
        } else {
          constraint.Stretch = vec3.fromValues(0, 1, 0);
        }
      }
    }

    if (this.HandleHardConstraints !== null) {
      this.HandleHardConstraints(this);
    }
  }

  update(Speed) {
    if (!Ttp.IsPause) {
      for (let i = 0; i < Speed; i++) {
        this.accumulateForces();
        this.verletStep();
        this.satisfyConstraints();
      }
    }
  }

  draw() {
    for (let y = 0; y < this.H; y++) {
      for (let x = 0; x < this.W; x++) {
        Ttp.DrawCylinder(
          this.P[this.Constraints[y * this.W + x].ParticleA],
          0.3,
          this.P[this.Constraints[y * this.W + x].ParticleB],
          0.3,
          vec4.scale(vec4.create(), this.Constraints[y * this.W + x].Stretch, 80),
          MatrIdentity()
        );
      }
    }

    for (let y = 0; y < this.H - 1; y++) {
      for (let x = 0; x < this.W; x++) {
        const constraint = this.Constraints[this.H * (this.W - 1) + y * this.W + x];
        const stretch = constraint.Stretch;
        const color = vec4.fromValues(1 - stretch[0] * 80, 1 - stretch[1] * 80, 1 - stretch[2] * 80, 1);

        Ttp.DrawCylinder(
          this.P[constraint.ParticleA],
          0.1,
          this.P[constraint.ParticleB],
          0.1,
          color,
          MatrIdentity()
        );
      }
    }
  }
}

// Usage example
const clothInstance = new Cloth();
clothInstance.createDefault(10, 10, 1, 0.06, 1);
clothInstance.update(10);
clothInstance.draw();
