/// <reference path="../../typings/lodash/lodash.d.ts" />
var MyGameUtil = (function () {
    function MyGameUtil() {
        this.actors = [];
        this.isPointerPressing = false;
        this.initNumberUtils();
    }
    MyGameUtil.prototype.updateActors = function () {
        this.actors = _.filter(this.actors, function (a) { return a.update() !== false; });
    };
    MyGameUtil.prototype.getActors = function (clazz) {
        return _.filter(this.actors, function (a) { return a instanceof clazz; });
    };
    MyGameUtil.prototype.initPointer = function (pointedElement) {
        this.pointerPos = { x: 0, y: 0 };
        this.pointedElement = pointedElement;
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        window.addEventListener('mousedown', this.onMouseDown);
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mouseup', this.onMouseUp);
        window.addEventListener('touchstart', this.onTouchStart);
        window.addEventListener('touchmove', this.onTouchMove);
        window.addEventListener('touchend', this.onTouchEnd);
    };
    MyGameUtil.prototype.enableShowingErrors = function () {
        window.addEventListener('error', function (error) {
            var result = document.getElementById('result') || (function () {
                var result = document.createElement('pre');
                result.setAttribute('id', 'result');
                document.getElementsByTagName('body')[0].appendChild(result);
                return result;
            })();
            var message = [error.filename, '@', error.lineno, ':\n', error.message].join('');
            result.textContent += '\n' + message;
            return false;
        });
    };
    MyGameUtil.prototype.setPointerPos = function (pageX, pageY) {
        var rect = this.pointedElement.getBoundingClientRect();
        this.pointerPos.x = (pageX - rect.left).clamp(0, rect.width);
        this.pointerPos.y = (pageY - rect.top).clamp(0, rect.height);
    };
    MyGameUtil.prototype.onMouseDown = function (event) {
        this.isPointerPressing = true;
        this.onMouseMove(event);
    };
    MyGameUtil.prototype.onMouseMove = function (event) {
        event.preventDefault();
        this.setPointerPos(event.pageX, event.pageY);
    };
    MyGameUtil.prototype.onMouseUp = function (event) {
        this.isPointerPressing = false;
    };
    MyGameUtil.prototype.onTouchStart = function (event) {
        this.isPointerPressing = true;
        this.onTouchMove(event);
    };
    MyGameUtil.prototype.onTouchMove = function (event) {
        event.preventDefault();
        var touch = event.touches[0];
        this.setPointerPos(touch.pageX, touch.pageY);
    };
    MyGameUtil.prototype.onTouchEnd = function (event) {
        this.isPointerPressing = false;
    };
    MyGameUtil.prototype.initNumberUtils = function () {
        Number.prototype.clamp = function (min, max) {
            if (min === void 0) { min = 0; }
            if (max === void 0) { max = 1; }
            return this < min ? min : (this > max ? max : this);
        };
        Number.prototype.wrap = function (min, max) {
            if (min === void 0) { min = 0; }
            if (max === void 0) { max = 1; }
            var w = max - min;
            var v = this - min;
            return v >= 0 ? v % w + min : w + v % w + min;
        };
        Number.prototype.random = function (from) {
            if (from === void 0) { from = 0; }
            return Math.random() * this + from;
        };
        Number.prototype.randomInt = function (from) {
            if (from === void 0) { from = 0; }
            return Math.floor(Math.random() * this) + from;
        };
    };
    return MyGameUtil;
})();
//# sourceMappingURL=MyGameUtil.js.map