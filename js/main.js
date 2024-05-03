const globalMouse = {
  x: undefined,
  y: undefined,
};

const cnv = document.querySelector(".cnv");

addEventListener("load", () => {
  resizeCanvas(cnv, innerHeight, innerWidth);
});

addEventListener("mousemove", e => {
  if (e.target !== cnv) return;
  const [x, y] = getClientCoords(e);
  globalMouse.x = x;
  globalMouse.y = y;
});

addEventListener("touchmove", e => {
  if (e.target !== cnv) return;
  const [x, y] = getClientCoords(e);
  globalMouse.x = x;
  globalMouse.y = y;
});

addEventListener("touchend", () => {
  globalMouse.x = undefined;
  globalMouse.y = undefined;
});

addEventListener("resize", () => {
  resizeCanvas(cnv, innerHeight, innerWidth);
});