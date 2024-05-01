class Particle {
  constructor(x, y, size, color) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;

    this.position = new Vector(x, y);
    this.basePosition = new Vector(x, y);
    this.velocity = new Vector();
    this.acceleration = new Vector();

    this.mouse = new Vector();

    this._fls = [
      new VectorFL(this.velocity, [0, 0], "red"),
      new VectorFL(this.acceleration, [0, 0], "lime"),
      new VectorFL(this.mouse, [0, 0], "blue")
    ];

    this._fls.forEach(fl => fl.scale = 10);
  }
  
  draw(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI*2);
    ctx.stroke();
    // ctx.fillStyle = this.color;
    // ctx.fillRect(this.position.x - this.size / 2, this.position.y - this.size / 2, this.size, this.size);
    ctx.restore();
  }
  
  update(ctx) {
    const { cos, sin, atan, atan2 } = Math;
    const that = this;

    const md = this.dist(this.system.mouse);

    this.mouse.x = (this.system.mouse.x - this.position.x) / 10;
    this.mouse.y = (this.system.mouse.y - this.position.y) / 10;

    this.mouse.x ||= 0;
    this.mouse.y ||= 0;

    this.position.addBy(this.velocity);
    this.velocity.addBy(this.acceleration);

    const extForces = [
      that.mouse
    ];

    extForces.forEach(f => this.acceleration.addBy(f));
    this.acceleration.cap(.05);

    this._updateVectorFLs();
    this.draw(ctx);
  }

  _updateVectorFLs() {
    this._fls.forEach(vec => {
      vec.origin[0] = this.position.x;
      vec.origin[1] = this.position.y;
    });
  }

  dist(obj) {
    return Math.hypot(this.x - obj.x, this.y - obj.y);
  }

  static create = (...args) => new Particle(...args);
}

class Effect {
  constructor(cnv, mouse) {
    this.cnv = cnv;
    this.ctx = cnv.getContext("2d") 
    this.particles = [];
    this.particleSize = ~~(this.cnv.width / 60);
    this.mouse = mouse;
    this.currAnim = null;
  }
  
  start() {
    this.particles.length = 0;
    cancelAnimationFrame(this.currAnim);
    this.animate(0);
  }
  
  addParticle(p) {
    p.system = this;
    this.particles.push(p);
  }
  
  animate(timestamp) {
    const that = this;
    this.currAnim = requestAnimationFrame(that.animate.bind(that));
    fillCtx(this.cnv, "#000");
    
    this.particles.forEach(particle => {
      particle.update(this.ctx);
    });

    this.showVectorField(this.cnv.getContext("2d"));
  }

  showVectorField(ctx) {
    VectorFL.pool.forEach(vec => {
      vec.draw(ctx)
    });
  }
}