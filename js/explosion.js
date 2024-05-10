class Explosion {
  constructor(posi, n, effect, size = 5, color = "cyan") {
    this.position = posi;
    this.n = n;
    this.size = size;
    this.color = color;
    this.effect = effect;
    this.particles = [];

    effect.explosions.push(this);

    for (let i = 0; i < n; i++) {
      const particle = this.createParticle(i / n * Math.PI * 2);
      particle._fls = [
        new VectorFL(particle.velocity, [posi.x, posi.y], "red", 20),
        new VectorFL(particle.gravity, [posi.x, posi.y], "yellow"),
        new VectorFL(particle.damp, [posi.x, posi.y], "lime", 5),
      ];
      this.particles.push(particle);
    }
  }

  createParticle(i) {
    const that = this;
    const speed = Math.random() + 1;

    return {
      position: new Vector(that.position.x, that.position.y),
      size: that.size,
      baseSize: that.size,
      decayRate: that.size / 200,
      color: that.color,
      velocity: new Vector(speed * Math.cos(i), speed * Math.sin(i)),
      parent: that,
      mass: innerHeight,
      
      acceleration: new Vector(),
      gravity: new Vector(),
      damp: new Vector(),

      updateFls() {
        this._fls.forEach(fl => {
          fl.origin[0] = this.position.x;
          fl.origin[1] = this.position.y;
        });
      },

      draw(ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI);
        ctx.strokeStyle = this.color;
        ctx.stroke();
        ctx.restore();
      },

      update(ctx) {
        const G = 1 / 2;
        const ms = 2*this.mass;
        const r = this.parent.effect.cnv.height - this.position.y;
        
        this.gravity.y = G * ms * this.mass / r ** 2;
        
        const b = 1.5;
        this.damp.x = -b*this.velocity.x;
        this.damp.y = -b*this.velocity.y;
        
        const extForces = [
          this.gravity,
          this.damp
        ];

        this.acceleration
          .assign(extForces.reduce((a, b) => a.add(b), new Vector()).scale(1 / this.mass));

        this.velocity.addBy(this.acceleration);
        this.position.addBy(this.velocity);
        this.size -= this.decayRate;

        if (this.size <= 0) return this.remove();
        this.draw(ctx);
        this.updateFls();
      },

      remove() {
        const i = that.particles.findIndex(p => p === this);
        const ctx = that.effect.ctx;

        this._fls.forEach(fl => fl.remove());
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.baseSize*2, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
        that.particles.splice(i, 1);
      }
    }
  }

  update(ctx) {
    this.particles.forEach(p => p.update(ctx));
  }
}