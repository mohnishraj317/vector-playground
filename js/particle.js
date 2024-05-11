class Particle {
  constructor(x, y, size, color) {
    this.size = size;
    this.color = color;
    this.mass = innerHeight * 100;
    
    this.bullets = [];
    this.lastShootTime = 0;
    this.shootInterval = 1;
    
    // setTimeout(() => cancelAnimationFrame(this.system.currAnim), 4000);

    this.position = new Vector(x, y);
    this.basePosition = new Vector(x, y);
    this.velocity = new Vector();
    this.acceleration = new Vector();

    this.mouse = new Vector();
    this.damp = new Vector();
    this.gunDir = new Vector();
    
    this.b = 5e2;

    this._fls = [
      // new VectorFL(this.gunDir, [0, 0], "cyan", 10),
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
    
    this.gunDir.x = (this.system.mouse.x || this.system.lastMouse.x) - this.position.x;
    this.gunDir.y = (this.system.mouse.y || this.system.lastMouse.y) - this.position.y;
    
    this.damp.x = -this.b*this.velocity.x;
    this.damp.y = -this.b*this.velocity.y;
    
    const extForces = [
      this.mouse,
      this.damp,
    ];

    this.acceleration
      .assign(extForces.reduce((a, b) => a.add(b), new Vector()).scale(1/this.mass));

    this.position.addBy(this.velocity);
    this.velocity.addBy(this.acceleration)
        // .cap(Particle.MAX_VELOCITY);
    this._updateVectorFLs();
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
      //"#FFA500"
      "cyan"
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
    
    const G = 5;
    const ms = this.mass * 50;
    const R = this.parent.system.cnv.height / 3;
    const r = this.parent.system.cnv.height - this.position.y;
    this.gravity.y = G*ms*this.mass / (r + R)**2;
    
    const b = 1;
    this.damp.x = -b*this.velocity.x;
    this.damp.y = -b*this.velocity.y;
    
    const extForces = [
      this.gravity,
      this.damp
    ];
  
    this.acceleration
      .assign(extForces.reduce((a, b) => a.add(b), new Vector()).scale(1/this.mass));

    this.velocity.addBy(this.acceleration);
    this.position.addBy(this.velocity);

    this._updateVectorFLs();
    this.draw(ctx);
  }
  
  remove() {
    const i = this.parent.bullets.findIndex(b => b === this);
    this.parent.bullets.splice(i, 1);
    
    new Explosion(this.position.copy(), 5, this.parent.system)
    
    this._fls.forEach(fl => fl.remove());
  }
  
  _updateVectorFLs() {
    this._fls.forEach(vec => {
      vec.origin[0] = this.position.x;
      vec.origin[1] = this.position.y;
    });
  }
}