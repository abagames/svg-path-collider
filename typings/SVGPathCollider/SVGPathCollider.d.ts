declare class SVGPathCollider {
	constructor
		(path: SVGPathElement,
		separationNum?: number,
		isConcave?: boolean);
	update();
	test(other: SVGPathCollider);
	showCollision(isShowingCollision?: boolean);
}
