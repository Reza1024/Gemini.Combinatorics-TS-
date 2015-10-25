module Gemini.Drawings {
	export class Point {
		x: number;
		y: number;
		constructor(x?: number, y?: number) {
			this.x = x;
			this.y = y;
		}
	}
	export class Rect {
		left: number;
		top: number;
		width: number;
		height: number;
		constructor(left?: number, top?: number, width?: number, height?: number) {
			this.left = left;
			this.top = top;
			this.width = width;
			this.height = height;
		}
	}
}