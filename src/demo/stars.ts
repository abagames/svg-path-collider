/// <reference path="../../typings/lodash/lodash.d.ts" />
/// <reference path="../../typings/GIFCaptureCanvas/GifCaptureCanvas.d.ts" />
/// <reference path="../SVGPathCollider.ts" />
/// <reference path="MyGameUtil.ts" />

var svgElm: SVGElement;
var mgu: MyGameUtil;
var gcc: GifCaptureCanvas;

window.onload = () => {
	svgElm = createElementNS('svg');
	var svgElmSize = 480;
	svgElm.setAttribute('width', `${svgElmSize}`);
	svgElm.setAttribute('height', `${svgElmSize}`);
	svgElm.setAttribute('style', 'background: white');
	document.body.appendChild(svgElm);
	mgu = new MyGameUtil();
	mgu.initPointer(svgElm);
	gcc = new GifCaptureCanvas();
	_.times(5, (i) => {
		var n = randomInt(6, 12);
		var r1 = randomInt(20, 40);
		var r2 = r1 + randomInt(50, 90);
		var x = ((i - 1) % 2) * 240 + 120;
		var y = i * 96;
		var star = new Star
			(n, r1, r2, n * 2,
			x + randomInt(-32, 32), y + randomInt(-32, 32),
			randomInt(-10, 10) * 0.1);
		if (i === 0) {
			star.isPointer = true;
			star.pos = mgu.pointerPos;
		}
		mgu.actors.push(star);
	});
	update();
};

function randomInt(from: number, to: number) {
	return Math.floor(Math.random() * (to - from + 1)) + from;
}

function update() {
	requestAnimationFrame(update);
	mgu.updateActors();
	gcc.captureSvg(svgElm);
}

class Star {
	svg: SVGPathElement;
	spc: SVGPathCollider;
	pos: { x: number, y: number };
	angle = 0;
	isPointer = false;

	constructor
		(n: number, r1: number, r2: number, separationNum: number,
		x: number, y: number, public angleVel: number) {
		this.svg = <SVGPathElement> createElementNS('path');
		var pathStr = `M0,${r1}`;
		_.times(n, (i) => {
			var d = (i + 0.5) * 6.28 / n;
			var r = r2;
			pathStr += `Q${Math.sin(d) * r},${Math.cos(d) * r},`;
			d += 6.28 / n / 2;
			r = r1;
			pathStr += `${Math.sin(d) * r},${Math.cos(d) * r}`;
		});
		pathStr += 'z';
		this.svg.setAttribute('d', pathStr);
		svgElm.appendChild(this.svg);
		this.spc = new SVGPathCollider(this.svg, separationNum, true);
		this.spc.showCollision();
		this.pos = { x: x, y: y };
	}

	update() {
		this.angle += this.angleVel;
		transformSvg(this.svg, this.pos, this.angle);
		this.spc.update();
		if (this.isPointer) {
			var isColliding = false;
			_.forEach(mgu.getActors(Star), (st: Star) => {
				if (st.isPointer) {
					return;
				}
				var fc = '#88e';
				if (this.spc.test(st.spc)) {
					isColliding = true;
					fc = '#e8c';
				}
				st.svg.setAttribute('fill', fc);
			});
			var fc = '#8e8';
			if (isColliding) {
				fc = '#ec8';
			}
			this.svg.setAttribute('fill', fc);
		}
	}
}

function createElementNS(type: string): SVGElement {
	return <SVGElement> document.createElementNS
		('http://www.w3.org/2000/svg', type);
}

function transformSvg(svg: SVGElement, pos, angle) {
	svg.setAttribute
		('transform', `translate(${pos.x},${pos.y}) rotate(${angle})`)
}
