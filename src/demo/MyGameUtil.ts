/// <reference path="../../typings/lodash/lodash.d.ts" />

class MyGameUtil {
	constructor() {
		this.initNumberUtils();
	}

	actors = [];

	updateActors() {
		this.actors = _.filter(this.actors, (a) => a.update() !== false);
	}

	getActors(clazz) {
		return _.filter(this.actors, (a) => a instanceof clazz);
	}

	pointerPos: { x: number, y: number };
	pointedElement: Element;
	isPointerPressing = false;

	initPointer(pointedElement: Element) {
		this.pointerPos = { x: 0, y: 0 };
		this.pointedElement = pointedElement;
		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.onMouseUp = this.onMouseUp.bind(this);
		this.onTouchStart = this.onTouchStart.bind(this);
		this.onTouchMove = this.onTouchMove.bind(this);
		this.onTouchEnd = this.onTouchEnd.bind(this);
		window.addEventListener('mousedown', this.onMouseDown);
		window.addEventListener('mousemove', this.onMouseMove);
		window.addEventListener('mouseup', this.onMouseUp);
		window.addEventListener('touchstart', this.onTouchStart);
		window.addEventListener('touchmove', this.onTouchMove);
		window.addEventListener('touchend', this.onTouchEnd);
	}

	enableShowingErrors() {
		window.addEventListener('error', function(error: any) {
			var result = document.getElementById('result') || (function() {
				var result = document.createElement('pre');
				result.setAttribute('id', 'result');
				document.getElementsByTagName('body')[0].appendChild(result);
				return result;
			})();
			var message = [error.filename, '@', error.lineno, ':\n', error.message].join('');
			result.textContent += '\n' + message;
			return false;
		});
	}

	setPointerPos(pageX: number, pageY: number) {
		var rect = this.pointedElement.getBoundingClientRect();
		this.pointerPos.x = (pageX - rect.left).clamp(0, rect.width);
		this.pointerPos.y = (pageY - rect.top).clamp(0, rect.height);
	}

	onMouseDown(event: MouseEvent) {
		this.isPointerPressing = true;
		this.onMouseMove(event);
	}

	onMouseMove(event: MouseEvent) {
		event.preventDefault();
		this.setPointerPos(event.pageX, event.pageY);
	}

	onMouseUp(event: MouseEvent) {
		this.isPointerPressing = false;
	}

	onTouchStart(event: TouchEvent) {
		this.isPointerPressing = true;
		this.onTouchMove(event);
	}

	onTouchMove(event: TouchEvent) {
		event.preventDefault();
		var touch = event.touches[0];
		this.setPointerPos(touch.pageX, touch.pageY);
	}

	onTouchEnd(event: TouchEvent) {
		this.isPointerPressing = false;
	}

	initNumberUtils() {
		Number.prototype.clamp = function(min: number = 0, max: number = 1): number {
			return this < min ? min : (this > max ? max : this);
		};
		Number.prototype.wrap = function(min: number = 0, max: number = 1): number {
			var w = max - min;
			var v = this - min;
			return v >= 0 ? v % w + min : w + v % w + min;
		};
		Number.prototype.random = function(from: number = 0): number {
			return Math.random() * this + from;
		};
		Number.prototype.randomInt = function(from: number = 0): number {
			return Math.floor(Math.random() * this) + from;
		};
	}
}

interface Number {
	clamp(min?: number, max?: number): number;
	wrap(min?: number, max?: number): number;
	random(from?: number): number;
	randomInt(from?: number): number;
}
