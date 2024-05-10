class Vector {
  constructor(x=0, y=0) {
    this.x = x;
    this.y = y;
  }
  
  get mag() {
    return Math.hypot(this.x, this.y);
  }
  
  get angle() {
    return Math.atan2(this.y, this.x);
  }

  add(vec) {
    return new Vector(this.x + vec.x, this.y + vec.y);
  }

  cap(mag) {
    if (this.mag > mag) {
      this.x = mag*Math.cos(this.angle);
      this.y = mag*Math.sin(this.angle);
    }
    
    return this;
  }

  addBy(vec) {
    this.x += vec.x;
    this.y += vec.y;
    
    return this;
  }

  dotProd(vec) {
    return this.x * vec.x + this.y * vec.y;
  }
  
  scale(scaler) {
    this.x *= scaler;
    this.y *= scaler;
    return this;
  }
  
  assign(vec) {
    this.x = vec.x;
    this.y = vec.y;
    return this;
  }
  
  copy() {
    return new Vector(this.x, this.y);
  }
  
  setMag(mag) {
    const x = mag*Math.cos(this.angle);
    const y = mag*Math.sin(this.angle);
    
    this.x = x;
    this.y = y;
    
    return this;
  }
}

class VectorFL {
  constructor(vec, origin, color, scale=1) {
    this.vec = vec;
    this.origin = origin;
    this.color = color;
    this.scale = scale;

    VectorFL.pool.push(this);
  }

  draw(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(...this.origin);
    ctx.lineTo(this.origin[0] + this.vec.x*this.scale, this.origin[1] + this.vec.y*this.scale);

    const that = this;

    function drawHead(lineSize=10) {
      const theta = that.vec.angle;
      const initial = [that.origin[0] + that.vec.x*that.scale, that.origin[1] + that.vec.y*that.scale];
      ctx.translate(...initial);
      ctx.rotate(theta);
      ctx.moveTo(0, 0);
      ctx.lineTo(-lineSize*Math.cos(Math.PI/6), -lineSize*Math.sin(Math.PI/6));
      ctx.moveTo(0, 0);
      ctx.lineTo(-lineSize*Math.cos(Math.PI/6), lineSize*Math.sin(Math.PI/6));
    }

    drawHead();
    ctx.strokeStyle = this.color;
    ctx.stroke();
    ctx.restore();
  }
  
  remove() {
    const i = VectorFL.pool.findIndex(v => v === this);
    VectorFL.pool.splice(i, 1);
  }

  static pool = [];
}