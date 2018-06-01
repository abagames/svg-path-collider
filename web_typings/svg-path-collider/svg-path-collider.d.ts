declare module "svg-path-collider" {
  export default class SVGPathCollider {
    constructor(
      path: SVGPathElement,
      separationNum?: number,
      isConcave?: boolean
    );
    update();
    test(other: SVGPathCollider);
    showCollision(isShowingCollision?: boolean);
  }
}
