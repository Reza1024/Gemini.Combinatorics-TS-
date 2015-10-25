module Gemini.Combinatorics {
	export class PlaneGraphFace {
		index: number;
		startEdge: PlaneEdge;
		size: number;

		get edges() {
			const edges: PlaneEdge[] = new Array(this.size);
			let e = this.startEdge;
			let i = 0;
			do {
				edges[i++] = e;
				e = e.nextOnFace;
			} while (e !== this.startEdge);

			return edges;
		}

		get vertices() {
			const vertices: number[] = new Array(this.size);
			let e = this.startEdge;
			let i = 0;
			do {
				vertices[i++] = e.start;
				e = e.nextOnFace;
			} while (e !== this.startEdge);

			return vertices;
		}
	}
}