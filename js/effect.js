class Effect {
  constructor(cnv, mouse) {
    this.cnv = cnv;
    this.ctx = cnv.getContext("2d");
    this.particles = [];
    this.particleSize = ~~(this.cnv.width / 60);
    this.explosions = [];
    this.explosionSize = 2;
    this.mouse = mouse;
    this.lastMouse = { x: mouse.x || 0, y: mouse.y || 0 };
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
          (bullet.position.x <= 0 || bullet.position.x >= this.cnv.width) ||
          (bullet.position.y <= 0 || bullet.position.y >= this.cnv.height)
        )
          bullet.remove();
      })
    });
    
    this.explosions.forEach(explosion => {
      explosion.update(this.ctx);
      const del = 10;
      
      if (
        (explosion.position.x <= -del || explosion.position.x >= this.cnv.width + del) ||
        (explosion.position.y <= -del || explosion.position.y >= this.cnv.height + del)
      )
        explosion.remove();
    });

    if (this._vecVis) this.showVectorField(this.cnv.getContext("2d"));
  }

  showVectorField(ctx) {
    VectorFL.pool.forEach(vec => {
      vec.draw(ctx)
    });
  }
}