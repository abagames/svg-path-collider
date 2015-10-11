/// <reference path="../../typings/lodash/lodash.d.ts" />
/// <reference path="../../typings/GIFCaptureCanvas/GifCaptureCanvas.d.ts" />
/// <reference path="../SVGPathCollider.ts" />
/// <reference path="MyGameUtil.ts" />
var svgElm;
var mgu;
var gcc;
var image = new Image();
var ticks = 0;
window.onload = function () {
    svgElm = createElementNS('svg');
    var svgElmSize = 480;
    svgElm.setAttribute('width', "" + svgElmSize);
    svgElm.setAttribute('height', "" + svgElmSize);
    svgElm.setAttribute('style', 'background: white');
    document.body.appendChild(svgElm);
    mgu = new MyGameUtil();
    mgu.initPointer(svgElm);
    gcc = new GifCaptureCanvas();
    _.times(5, function (i) {
        var n = randomInt(6, 12);
        var r1 = randomInt(20, 40);
        var r2 = r1 + randomInt(50, 90);
        var x = ((i - 1) % 2) * 240 + 120;
        var y = i * 96;
        var star = new Star(n, r1, r2, n * 2, x + randomInt(-32, 32), y + randomInt(-32, 32), randomInt(-10, 10) * 0.1);
        if (i === 0) {
            star.isPointer = true;
            star.pos = mgu.pointerPos;
        }
        mgu.actors.push(star);
    });
    update();
};
function randomInt(from, to) {
    return Math.floor(Math.random() * (to - from + 1)) + from;
}
function update() {
    requestAnimationFrame(update);
    mgu.updateActors();
    if (ticks % 3 === 0) {
        var svgXml = new XMLSerializer().serializeToString(svgElm);
        image.src = "data:image/svg+xml;base64," + btoa(svgXml);
        gcc.capture(image);
    }
    ticks++;
}
var Star = (function () {
    function Star(n, r1, r2, separationNum, x, y, angleVel) {
        this.angleVel = angleVel;
        this.angle = 0;
        this.isPointer = false;
        this.svg = createElementNS('path');
        var pathStr = "M0," + r1;
        _.times(n, function (i) {
            var d = (i + 0.5) * 6.28 / n;
            var r = r2;
            pathStr += "Q" + Math.sin(d) * r + "," + Math.cos(d) * r + ",";
            d += 6.28 / n / 2;
            r = r1;
            pathStr += Math.sin(d) * r + "," + Math.cos(d) * r;
        });
        pathStr += 'z';
        this.svg.setAttribute('d', pathStr);
        svgElm.appendChild(this.svg);
        this.spc = new SVGPathCollider(this.svg, separationNum, true);
        this.spc.showCollision();
        this.pos = { x: x, y: y };
    }
    Star.prototype.update = function () {
        var _this = this;
        this.angle += this.angleVel;
        transformSvg(this.svg, this.pos, this.angle);
        this.spc.update();
        if (this.isPointer) {
            var isColliding = false;
            _.forEach(mgu.getActors(Star), function (st) {
                if (st.isPointer) {
                    return;
                }
                var fc = '#88e';
                if (_this.spc.test(st.spc)) {
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
    };
    return Star;
})();
function createElementNS(type) {
    return document.createElementNS('http://www.w3.org/2000/svg', type);
}
function transformSvg(svg, pos, angle) {
    svg.setAttribute('transform', "translate(" + pos.x + "," + pos.y + ") rotate(" + angle + ")");
}
//# sourceMappingURL=stars.js.map