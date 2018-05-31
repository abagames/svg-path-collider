// SVGPathCollider (https://github.com/abagames/SVGPathCollider)
//  test collision between svg paths

import * as SAT from "sat";

export default class SVGPathCollider {
  constructor(
    public path: SVGPathElement,
    public separationNum = 16,
    public isConcave: boolean = false
  ) {
    this.boundingBox = new SAT.Polygon(
      new SAT.Vector(),
      this.times(4, () => new SAT.Vector())
    );
    this.collisionArea = new SAT.Polygon(
      new SAT.Vector(),
      this.times(separationNum, () => new SAT.Vector())
    );
    var ose = path.ownerSVGElement;
    this.boundingPoints = this.times(4, () => ose.createSVGPoint());
    if (isConcave) {
      this.concaveCollisionAreas = this.times(
        separationNum,
        () =>
          new SAT.Polygon(
            new SAT.Vector(),
            this.times(3, () => new SAT.Vector())
          )
      );
    }
  }

  update() {
    this.shouldBeUpdatingBoundingBox = true;
    this.shouldBeUpdatingCollisionArea = true;
    if (this.isShowingCollision) {
      var visibility = this.isBoundingBoxColliding ? "visible" : "hidden";
      this.collisionAreaSvg.setAttribute("visibility", visibility);
    }
    this.isBoundingBoxColliding = false;
  }

  test(other: SVGPathCollider) {
    this.updateBoundingBox();
    other.updateBoundingBox();
    if (!SAT.testPolygonPolygon(this.boundingBox, other.boundingBox)) {
      return false;
    }
    this.isBoundingBoxColliding = true;
    other.isBoundingBoxColliding = true;
    this.updateCollisionArea();
    other.updateCollisionArea();
    if (this.isConcave) {
      return this.concaveCollisionAreas.some(cca => other.testToPolygon(cca));
    } else {
      return other.testToPolygon(this.collisionArea);
    }
  }

  showCollision(isShowingCollision = true) {
    this.isShowingCollision = isShowingCollision;
    var ose = this.path.ownerSVGElement;
    if (this.boundingBoxSvg != null) {
      ose.removeChild(this.boundingBoxSvg);
      this.boundingBoxSvg = null;
    }
    if (this.collisionAreaSvg != null) {
      ose.removeChild(this.collisionAreaSvg);
      this.collisionAreaSvg = null;
    }
    if (this.isShowingCollision) {
      this.boundingBoxSvg = this.createPath();
      ose.appendChild(this.boundingBoxSvg);
      this.collisionAreaSvg = this.createPath(2, 5);
      ose.appendChild(this.collisionAreaSvg);
    }
  }

  shouldBeUpdatingBoundingBox = true;
  boundingBox: SAT.Polygon = new SAT.Polygon();
  shouldBeUpdatingCollisionArea = true;
  collisionArea: SAT.Polygon;
  concaveCollisionAreas: SAT.Polygon[];
  boundingPoints: SVGPoint[];
  isShowingCollision = false;
  boundingBoxSvg: SVGElement = null;
  collisionAreaSvg: SVGElement = null;
  isBoundingBoxColliding = false;

  updateBoundingBox() {
    if (!this.shouldBeUpdatingBoundingBox) {
      return;
    }
    this.shouldBeUpdatingBoundingBox = false;
    this.pathToBoundingBox(this.path, this.boundingBox.points);
    this.boundingBox.setAngle(0);
    if (this.isShowingCollision) {
      this.boundingBoxSvg.setAttribute(
        "d",
        this.satPolygonToPathStr(this.boundingBox)
      );
    }
  }

  updateCollisionArea() {
    if (!this.shouldBeUpdatingCollisionArea) {
      return;
    }
    this.shouldBeUpdatingCollisionArea = false;
    this.pathToCollisionArea(this.path, this.collisionArea.points);
    if (this.isShowingCollision) {
      this.collisionAreaSvg.setAttribute(
        "d",
        this.satPolygonToPathStr(this.collisionArea)
      );
    }
    if (this.isConcave) {
      var centerPos = new SAT.Vector();
      this.collisionArea.points.forEach(pt => {
        centerPos.x += pt.x;
        centerPos.y += pt.y;
      });
      var pl = this.separationNum;
      centerPos.x /= pl;
      centerPos.y /= pl;
      this.times(pl, i => {
        var p1 = this.collisionArea.points[i];
        var p2 = this.collisionArea.points[(i + 1) % pl];
        var cca = this.concaveCollisionAreas[i];
        var pts = cca.points;
        pts[0].x = p1.x;
        pts[0].y = p1.y;
        pts[1].x = p2.x;
        pts[1].y = p2.y;
        pts[2].x = centerPos.x;
        pts[2].y = centerPos.y;
        cca.setAngle(0);
      });
    } else {
      this.collisionArea.setAngle(0);
    }
  }

  testToPolygon(polygon: SAT.Polygon) {
    if (this.isConcave) {
      return this.concaveCollisionAreas.some(cca =>
        SAT.testPolygonPolygon(cca, polygon)
      );
    } else {
      return SAT.testPolygonPolygon(this.collisionArea, polygon);
    }
  }

  pathToBoundingBox(path: SVGPathElement, points: SAT.Vector[]) {
    const bbox = path.getBBox();
    const ctm = path.getCTM();
    this.boundingPoints[0].x = bbox.x;
    this.boundingPoints[0].y = bbox.y;
    this.boundingPoints[1].x = bbox.x + bbox.width;
    this.boundingPoints[1].y = bbox.y;
    this.boundingPoints[2].x = bbox.x + bbox.width;
    this.boundingPoints[2].y = bbox.y + bbox.height;
    this.boundingPoints[3].x = bbox.x;
    this.boundingPoints[3].y = bbox.y + bbox.height;
    this.boundingPoints.forEach((bp, i) => {
      bp = bp.matrixTransform(ctm);
      var pt = points[i];
      pt.x = bp.x;
      pt.y = bp.y;
    });
  }

  pathToCollisionArea(path: SVGPathElement, points: SAT.Vector[]) {
    const ctm = path.getCTM();
    const tl = path.getTotalLength();
    let l = 0;
    points.forEach(pt => {
      var pal = path.getPointAtLength(l).matrixTransform(ctm);
      pt.x = pal.x;
      pt.y = pal.y;
      l += tl / this.separationNum;
    });
  }

  satPolygonToPathStr(polygon: SAT.Polygon) {
    let str = "M";
    polygon.points.forEach((pt, i) => {
      str += `${pt.x},${pt.y} `;
    });
    str += "z";
    return str;
  }

  createPath(width = 1, dasharray = 10) {
    const svg = <SVGElement>document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    svg.setAttribute("stroke", "#777");
    svg.setAttribute("stroke-width", `${width}`);
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke-dasharray", `${dasharray}`);
    return svg;
  }

  times(count: number, func: Function) {
    let result = [];
    for (let i = 0; i < count; i++) {
      result.push(func(i));
    }
    return result;
  }
}
