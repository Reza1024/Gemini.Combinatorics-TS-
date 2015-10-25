module Gemini.Combinatorics {
	export class PlaneEdge {
		start: number;
		end: number;
		index: number;
		rightFace: number;
		next: PlaneEdge;
		prev: PlaneEdge;
		inverse: PlaneEdge;
		private _isMarked: boolean;

		constructor(start?: number, end?: number) {
			this.start = start;
			this.end = end;
			this.index = -1;
			this.rightFace = -1;
			this.next = null;
			this.prev = null;
			this._isMarked = false;
			this.inverse = null;
		}

		get nextOnFace() {
			return this.inverse.prev;
		}

		get prevOnFace() {
			return this.prev.inverse;
		}

		get isMarked() {
			return this._isMarked;
		}

		set isMarked(isMarked: boolean) {
			this._isMarked = isMarked;
		}
	}
}