class Particle {
  constructor(x, y, size, color) {
    this.size = size;
    this.color = color;
    this.mass = 1;
    this._vecVisibility = true;

    this.position = new Vector(x, y);
    this.basePosition = new Vector(x, y);
    this.velocity = new Vector();
    this.acceleration = new Vector();

    this.mouse = new Vector();
    this.damp = new Vector();
    this.baseForce = new Vector();
    
    this.b = 2;
    this.k = .2;

    this._fls = [
      new VectorFL(this.velocity, [0, 0], "red"),
      new VectorFL(this.acceleration, [0, 0], "lime"),
      new VectorFL(this.mouse, [0, 0], "blue"),
      new VectorFL(this.damp, [0, 0], "hotpink"),
      new VectorFL(this.baseForce, [0, 0], "yellow"),
    ];

    this._fls.forEach(fl => fl.scale = 10);
  }
  
  draw(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI*2);
    ctx.stroke();
    ctx.restore();
  }
  
  update(ctx) {
    const { cos, sin, atan, atan2 } = Math;
    const that = this;
    
    this.mouse.x = (this.system.mouse.x - this.position.x) / 10;
    this.mouse.y = (this.system.mouse.y - this.position.y) / 10;

    this.mouse.x ||= 0;
    this.mouse.y ||= 0;

    this.position.addBy(this.velocity);
    this.velocity.addBy(this.acceleration);
    
    this.damp.x = -this.b*this.velocity.x;
    this.damp.y = -this.b*this.velocity.y;
    
    this.baseForce.x = this.k*(this.basePosition.x - this.position.x);
    this.baseForce.y = this.k*(this.basePosition.y - this.position.y);

    const extForces = [
      this.mouse,
      this.damp,
      this.baseForce
    ];

    extForces.forEach(f => this.acceleration.addBy(f) / this.mass);
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
    this._vecVis = true;
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

    if (this._vecVis) this.showVectorField(this.cnv.getContext("2d"));
  }

  showVectorField(ctx) {
    VectorFL.pool.forEach(vec => {
      vec.draw(ctx)
    });
  }
}