// SVGPathCollider (https://github.com/abagames/SVGPathCollider)
//  test a collision between two SVG paths
/// <reference path="../typings/lodash/lodash.d.ts" />
/// <reference path="../typings/SAT/SAT.d.ts" />
var SVGPathCollider = (function () {
    function SVGPathCollider(path, separationNum, isConcave) {
        if (separationNum === void 0) { separationNum = 16; }
        if (isConcave === void 0) { isConcave = false; }
        this.path = path;
        this.separationNum = separationNum;
        this.isConcave = isConcave;
        this.shouldBeUpdatingBoundingBox = true;
        this.boundingBox = new SAT.Polygon();
        this.shouldBeUpdatingCollisionArea = true;
        this.isShowingCollision = false;
        this.boundingBoxSvg = null;
        this.collisionAreaSvg = null;
        this.isBoundingBoxColliding = false;
        this.boundingBox = new SAT.Polygon(new SAT.Vector(), _.times(4, function () { return new SAT.Vector(); }));
        this.collisionArea = new SAT.Polygon(new SAT.Vector(), _.times(separationNum, function () { return new SAT.Vector(); }));
        var ose = path.ownerSVGElement;
        this.boundingPoints = _.times(4, function () { return ose.createSVGPoint(); });
        if (isConcave) {
            this.concaveCollisionAreas = _.times(separationNum, function () {
                return new SAT.Polygon(new SAT.Vector(), _.times(3, function () { return new SAT.Vector(); }));
            });
        }
    }
    SVGPathCollider.prototype.update = function () {
        this.shouldBeUpdatingBoundingBox = true;
        this.shouldBeUpdatingCollisionArea = true;
        if (this.isShowingCollision) {
            var visibility = this.isBoundingBoxColliding ? 'visible' : 'hidden';
            this.collisionAreaSvg.setAttribute('visibility', visibility);
        }
        this.isBoundingBoxColliding = false;
    };
    SVGPathCollider.prototype.test = function (other) {
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
            return _.some(this.concaveCollisionAreas, function (cca) { return other.testToPolygon(cca); });
        }
        else {
            return other.testToPolygon(this.collisionArea);
        }
    };
    SVGPathCollider.prototype.showCollision = function (isShowingCollision) {
        if (isShowingCollision === void 0) { isShowingCollision = true; }
        this.isShowingCollision = isShowingCollision;
        var ose = this.path.ownerSVGElement;
        if (!_.isNull(this.boundingBoxSvg)) {
            ose.removeChild(this.boundingBoxSvg);
            this.boundingBoxSvg = null;
        }
        if (!_.isNull(this.collisionAreaSvg)) {
            ose.removeChild(this.collisionAreaSvg);
            this.collisionAreaSvg = null;
        }
        if (this.isShowingCollision) {
            this.boundingBoxSvg = this.createPath();
            ose.appendChild(this.boundingBoxSvg);
            this.collisionAreaSvg = this.createPath(2, 5);
            ose.appendChild(this.collisionAreaSvg);
        }
    };
    SVGPathCollider.prototype.updateBoundingBox = function () {
        if (!this.shouldBeUpdatingBoundingBox) {
            return;
        }
        this.shouldBeUpdatingBoundingBox = false;
        this.pathToBoundingBox(this.path, this.boundingBox.points);
        this.boundingBox.setAngle(0);
        if (this.isShowingCollision) {
            this.boundingBoxSvg.setAttribute('d', this.satPolygonToPathStr(this.boundingBox));
        }
    };
    SVGPathCollider.prototype.updateCollisionArea = function () {
        var _this = this;
        if (!this.shouldBeUpdatingCollisionArea) {
            return;
        }
        this.shouldBeUpdatingCollisionArea = false;
        this.pathToCollisionArea(this.path, this.collisionArea.points);
        if (this.isShowingCollision) {
            this.collisionAreaSvg.setAttribute('d', this.satPolygonToPathStr(this.collisionArea));
        }
        if (this.isConcave) {
            var centerPos = new SAT.Vector();
            _.forEach(this.collisionArea.points, function (pt) {
                centerPos.x += pt.x;
                centerPos.y += pt.y;
            });
            var pl = this.separationNum;
            centerPos.x /= pl;
            centerPos.y /= pl;
            _.times(pl, function (i) {
                var p1 = _this.collisionArea.points[i];
                var p2 = _this.collisionArea.points[(i + 1) % pl];
                var cca = _this.concaveCollisionAreas[i];
                var pts = cca.points;
                pts[0].x = p1.x;
                pts[0].y = p1.y;
                pts[1].x = p2.x;
                pts[1].y = p2.y;
                pts[2].x = centerPos.x;
                pts[2].y = centerPos.y;
                cca.setAngle(0);
            });
        }
        else {
            this.collisionArea.setAngle(0);
        }
    };
    SVGPathCollider.prototype.testToPolygon = function (polygon) {
        if (this.isConcave) {
            return _.some(this.concaveCollisionAreas, function (cca) { return SAT.testPolygonPolygon(cca, polygon); });
        }
        else {
            return SAT.testPolygonPolygon(this.collisionArea, polygon);
        }
    };
    SVGPathCollider.prototype.pathToBoundingBox = function (path, points) {
        var bbox = path.getBBox();
        var ctm = path.getCTM();
        this.boundingPoints[0].x = bbox.x;
        this.boundingPoints[0].y = bbox.y;
        this.boundingPoints[1].x = bbox.x + bbox.width;
        this.boundingPoints[1].y = bbox.y;
        this.boundingPoints[2].x = bbox.x + bbox.width;
        this.boundingPoints[2].y = bbox.y + bbox.height;
        this.boundingPoints[3].x = bbox.x;
        this.boundingPoints[3].y = bbox.y + bbox.height;
        _.forEach(this.boundingPoints, function (bp, i) {
            bp = bp.matrixTransform(ctm);
            var pt = points[i];
            pt.x = bp.x;
            pt.y = bp.y;
        });
    };
    SVGPathCollider.prototype.pathToCollisionArea = function (path, points) {
        var _this = this;
        var ctm = path.getCTM();
        var tl = path.getTotalLength();
        var l = 0;
        _.forEach(points, function (pt) {
            var pal = path.getPointAtLength(l).matrixTransform(ctm);
            pt.x = pal.x;
            pt.y = pal.y;
            l += tl / _this.separationNum;
        });
    };
    SVGPathCollider.prototype.satPolygonToPathStr = function (polygon) {
        var str = 'M';
        _.forEach(polygon.points, function (pt, i) {
            str += pt.x + "," + pt.y + " ";
        });
        str += 'z';
        return str;
    };
    SVGPathCollider.prototype.createPath = function (width, dasharray) {
        if (width === void 0) { width = 1; }
        if (dasharray === void 0) { dasharray = 10; }
        var svg = document.
            createElementNS('http://www.w3.org/2000/svg', 'path');
        svg.setAttribute('stroke', '#777');
        svg.setAttribute('stroke-width', "" + width);
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke-dasharray', "" + dasharray);
        return svg;
    };
    return SVGPathCollider;
})();
