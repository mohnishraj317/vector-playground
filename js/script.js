const effect = new Effect(cnv, globalMouse);
effect.start();

addEventListener("load", () => {
  const origin = [effect.cnv.width / 2, effect.cnv.height / 2];
  const originVec = new Vector(...origin);
  
  // const p1 = new Particle(...origin, 10, "red");
  // effect.addParticle(p1);

  // p1.velocity.addBy(new Vector(1, 2));
});

addEventListener("click", e => {
  const [x, y] = getClientCoords(e);
  new Explosion(new Vector(x, y), 10, effect);
});

document
  .querySelector("#vec-vis")
  .addEventListener("change", e => {
    effect._vecVis = e.target.checked
  });