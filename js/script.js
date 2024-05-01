const effect = new Effect(cnv, globalMouse);
effect.start();

const origin = [null, null];

const p1 = new Particle(...origin, 10, "red");
effect.addParticle(p1);

addEventListener("load", () => {
  origin[0] = effect.cnv.width / 2;
  origin[1] = effect.cnv.height / 2;
  
  p1.position.addBy(new Vector(...origin));

  p1.velocity.x = 1;
  p1.velocity.y = 2;

  p1.acceleration.x = -.01;
  p1.acceleration.y = -.02;
});

addEventListener("mousemove", e => {
  const [x, y] = getClientCoords(e);

});