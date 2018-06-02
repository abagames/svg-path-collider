import SVGPathCollider from "../index";
import * as SVG from "svgjs";

interface SvgElm extends SVG.Element {
  collider?: SVGPathCollider;
}

let draw: SVG.Doc;
let polygon1: SvgElm;
let polygon2: SvgElm;

window.onload = () => {
  const svgElmSize = 480;
  const div = document.createElement("div");
  div.setAttribute("id", "div");
  document.body.appendChild(div);
  draw = SVG("div").size(svgElmSize, svgElmSize);
  polygon1 = draw.path("M0,0 100,0 150,100 -50,100 z");
  (polygon1
    .center(10, 200)
    .animate(2000, "<>")
    .center(250, 200) as any).loop(true, true);
  polygon1.collider = new SVGPathCollider(polygon1.native() as any);
  polygon2 = draw.path("M0,0 200,0 300,100 100,100 z");
  (polygon2
    .center(350, 200)
    .animate(3000)
    .rotate(360) as any).loop();
  polygon2.collider = new SVGPathCollider(polygon2.native() as any);
  update();
};

function update() {
  requestAnimationFrame(update);
  polygon1.collider.update();
  polygon2.collider.update();
  let fillColor = polygon1.collider.test(polygon2.collider) ? "#ec8" : "#8e8";
  polygon1.fill(fillColor);
  polygon2.fill(fillColor);
}
