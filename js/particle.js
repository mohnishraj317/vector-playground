class Particle {
  constructor(x, y, size, color) {
    this.size = size;
    this.color = color;
    this.mass = innerHeight * 100;
    
    this.bullets = [];
    this.lastShootTime = 0;
    this.shootInterval = 1;

    this.position = new Vector(x, y);
    this.basePosition = new Vector(x, y);
    this.velocity = new Vector();
    this.acceleration = new Vector();

    this.mouse = new Vector();
    this.damp = new Vector();
    
    this.b = 5e2;

    this._fls = [
      new VectorFL(this.velocity, [0, 0], "yellow", 10),
      new VectorFL(this.acceleration, [0, 0], "lime", 500),
      new VectorFL(this.mouse, [0, 0], "blue", .01),
      new VectorFL(this.damp, [0, 0], "hotpink", .01),
    ];
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
    
    this.mouse.x = (this.system.mouse.x - this.position.x);
    this.mouse.y = (this.system.mouse.y - this.position.y);

    this.mouse.x ||= 0;
    this.mouse.y ||= 0;

    this.mouse.setMag(this.mouse.mag**2);
    this.mouse.scale(.3);
    
    this.damp.x = -this.b*this.velocity.x;
    this.damp.y = -this.b*this.velocity.y;
    
    const extForces = [
      this.mouse,
      this.damp,
    ];

    this.acceleration
      .assign(extForces.reduce((a, b) => a.add(b), new Vector()).scale(1/this.mass));

    this._updateVectorFLs();
    this.position.addBy(this.velocity);
    this.velocity.addBy(this.acceleration)
        // .cap(Particle.MAX_VELOCITY);
    this.draw(ctx);
    
    if (this.lastShootTime >= this.shootInterval) {
      this.lastShootTime = 0;
      this.shoot(
        this.system.mouse.x || this.system.lastMouse.x,
        this.system.mouse.y || this.system.lastMouse.y);
    } else {
      this.lastShootTime++;
    }
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
  
  shoot(x, y) {
    const bullet = new Bullet(
      this.position.copy(),
      new Vector(x, y).addBy(this.position.copy().scale(-1)).setMag(10),
      this.color
    );
    bullet.parent = this;
    this.bullets.push(bullet);
  }
  
  static MAX_VELOCITY = 20;

  static create = (...args) => new Particle(...args);
}

class Bullet {
  constructor(position, velocity, color) {
    this.position = position;
    this.velocity = velocity;
    this.acceleration = new Vector();
    this.gravity = new Vector();
    this.damp = new Vector();
    
    this.mass = innerHeight / 10;
    this.size = 2;
    this.color = color;
    
    this._fls = [
      new VectorFL(this.velocity, [0, 0], "red", 10),
      new VectorFL(this.gravity, [0, 0], "yellow", 10),
      new VectorFL(this.damp, [0, 0], "lime", 10),
    ];
  }
  
  draw(ctx) {
    const mag = this.velocity.mag*10;
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
    ctx.moveTo(this.position.x, this.position.y)
    ctx.lineTo(
      this.position.x + mag*Math.cos(this.velocity.angle),
      this.position.y + mag*Math.sin(this.velocity.angle)
    );
    ctx.stroke();
    ctx.restore();
  }
  
  update(ctx) {
    const { cos, sin, atan, atan2 } = Math;
    const that = this;
    
    const G = 1/2;
    const ms = this.mass * 100;
    this.gravity.y = G*ms*this.mass / (this.parent.system.cnv.height - this.position.y)**2;
    
    const b = 1;
    this.damp.x = -b*this.velocity.x;
    this.damp.y = -b*this.velocity.y;
    
    const extForces = [
      this.gravity,
      this.damp
    ];
  
    this.acceleration
      .assign(extForces.reduce((a, b) => a.add(b), new Vector()).scale(1/this.mass));

    this._updateVectorFLs();
    this.velocity.addBy(this.acceleration);
    this.position.addBy(this.velocity);
    this.draw(ctx);
  }
  
  remove() {
    const i = this.parent.bullets.findIndex(b => b === this);
    this.parent.bullets.splice(i, 1);
    
    this._fls.forEach(fl => fl.remove());
  }
  
  _updateVectorFLs() {
    this._fls.forEach(vec => {
      vec.origin[0] = this.position.x;
      vec.origin[1] = this.position.y;
    });
  }
}

class Effect {
  constructor(cnv, mouse) {
    this.cnv = cnv;
    this.ctx = cnv.getContext("2d") 
    this.particles = [];
    this.particleSize = ~~(this.cnv.width / 60);
    this.mouse = mouse;
    this.lastMouse = {...mouse};
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
    
    this.lastMouse.x = this.mouse.x || this.lastMouse.x;
    this.lastMouse.y = this.mouse.y || this.lastMouse.y;

    this.particles.forEach(particle => {
      particle.update(this.ctx);
      
      particle.bullets.forEach(bullet => {
        bullet.update(this.ctx);
      
        if (
          (bullet.position.x < 0 || bullet.position.x > this.cnv.width) ||
          (bullet.position.y < 0 || bullet.position.y > this.cnv.height)
        ) bullet.remove();
      })
    });

    if (this._vecVis) this.showVectorField(this.cnv.getContext("2d"));
  }

  showVectorField(ctx) {
    VectorFL.pool.forEach(vec => {
      vec.draw(ctx)
    });
  }
}