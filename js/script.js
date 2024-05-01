const effect = new Effect(cnv, globalMouse);
effect.start();

const origin = [null, null];

const p1 = new Particle(...origin, 10, "red");
effect.addParticle(p1);

const p2 = new Particle(...origin, 5, "yellow");
effect.addParticle(p2);

addEventListener("load", () => {
  origin[0] = effect.cnv.width / 2;
  origin[1] = effect.cnv.height / 2;
  
  const originVec = new Vector(...origin);
  
  p2.mass = 5;
  
  p2.position.addBy(originVec);
  p2.basePosition.addBy(originVec);
  
  p1.position.addBy(originVec);
  p1.basePosition.addBy(originVec);

  p1.velocity.x = 1;
  p1.velocity.y = 2;

  p1.acceleration.x = -.01;
  p1.acceleration.y = -.02;
});

document.querySelector("#vec-vis")
  .addEventListener("change", e => {
    effect._vecVis = e.target.checked
  });

addEventListener("mousemove", e => {
  const [x, y] = getClientCoords(e);

});