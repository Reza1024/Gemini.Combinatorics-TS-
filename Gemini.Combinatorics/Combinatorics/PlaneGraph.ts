module Gemini.Combinatorics {
	export class PlaneGraph {
		vertexCount: number;
		edgeCount: number;
		faceCount: number;
		edges: PlaneEdge[];
		firstEdge: PlaneEdge[];
		degrees: number[];
		faces: PlaneGraphFace[];

		get hasLoop() {
			const edges = this.edges;
			for (let i in edges) {
				const e = edges[i];
				if (e.start === e.end)
					return true;
			}
			return false;
		}

		ensureFacesComputed() {
			if (this.faces)
				return;

			this.faces = new Array(2 - this.vertexCount + this.edgeCount / 2);

			this.resetMarks();

			this.faceCount = 0;

			for (let i = 0; i < this.vertexCount; i++) {
				const firstEdge = this.firstEdge[i];
				let e = firstEdge;
				do {
					if (!e.isMarked) {
						const f = new PlaneGraphFace();
						f.startEdge = e;
						f.index = this.faceCount;

						let faceSize = 0;
						let ef = e;
						do {
							ef.isMarked = true;
							ef.rightFace = f.index;
							faceSize++;
							ef = ef.nextOnFace;
						} while (ef !== e)
						f.size = faceSize;

						this.faces[this.faceCount++] = f;
					}

					e = e.next;
				} while (e !== firstEdge);
			}
		}

		clone() {
			const g = new PlaneGraph();
			g.vertexCount = this.vertexCount;
			g.edgeCount = this.edgeCount;
			g.degrees = new Array(this.vertexCount);
			g.firstEdge = new Array(this.vertexCount);
			g.edges = new Array(this.edgeCount);

			for (var i = 0; i < this.edgeCount; i++) {
				var e = this.edges[i];
				e.index = i;
				var eClone = new PlaneEdge(e.start, e.end);
				eClone.index = i;
				g.edges[i] = eClone;
			}

			g.edges.forEach((e) => {
				const eOld = this.edges[e.index];
				e.next = g.edges[eOld.next.index];
				e.prev = g.edges[eOld.prev.index];
				e.inverse = g.edges[eOld.inverse.index];
			});

			for (let v = 0; v < this.vertexCount; v++) {
				g.degrees[v] = this.degrees[v];
				g.firstEdge[v] = g.edges[this.firstEdge[v].index];
			}

			return g;
		}

		resetMarks() {
			this.edges.forEach((e) => {
				e.isMarked = false;
			});
		}

		getNeighbours(v: number) {
			const neighbours: number[] = new Array(this.degrees[v]);
			const first = this.firstEdge[v];
			let i = 0;
			let e = first;
			do {
				neighbours[i++] = e.end;
				e = e.next;
			} while (e !== first);

			return neighbours;
		}

		static fromIntCode(code: string) {
			var codeIndex = 0;
			if (!code)
				return null;
			const zeroCharCode = "0".charCodeAt(0);

			var vertexCount = 0;
			for (; code[codeIndex] !== " "; codeIndex++)
				vertexCount = vertexCount * 10 + (code.charCodeAt(codeIndex) - zeroCharCode);

			var g = new PlaneGraph();
			g.vertexCount = vertexCount;
			g.edgeCount = 0;
			g.edges = [];
			g.firstEdge = new Array(vertexCount);
			g.degrees = new Array(vertexCount);
			for (var i = 0; i < vertexCount; i++)
				g.degrees[i] = 0;

			for (var i = 0; i < vertexCount; i++) {
				var prevEdge = undefined;
				for (codeIndex++; code[codeIndex] !== "0"; codeIndex += 2) {
					var neighbour: number;
					if (code[codeIndex + 1] === " ")
						neighbour = code.charCodeAt(codeIndex) - zeroCharCode;
					else if (code[codeIndex + 2] === " ") {
						neighbour = (code.charCodeAt(codeIndex) - zeroCharCode) * 10 + (code.charCodeAt(codeIndex + 1) - zeroCharCode);
						codeIndex++;
					} else {
						neighbour = (code.charCodeAt(codeIndex) - zeroCharCode) * 100 + (code.charCodeAt(codeIndex + 1) - zeroCharCode) * 10 + (code.charCodeAt(codeIndex + 2) - zeroCharCode);
						codeIndex += 2;
					}

					neighbour--;
					var e = new PlaneEdge(i, neighbour);
					e.prev = prevEdge;

					if (prevEdge)
						prevEdge.next = e;
					else
						g.firstEdge[i] = e;

					prevEdge = e;

					g.edges.push(e);
					g.edgeCount++;
					g.degrees[i]++;
				}

				codeIndex++;
				prevEdge.next = g.firstEdge[i];
				g.firstEdge[i].prev = prevEdge;
			}

			for (var i = 0; i < vertexCount; i++) {
				if (g.degrees[i] == 0)
					continue;
				var e = g.firstEdge[i];
				var eLast = e;

				do {
					if (!e.inverse) {
						var ee = g.firstEdge[e.end];
						var eeLast = ee;
						if (ee) {
							do {
								if ((ee.end === i) && (!ee.inverse))
									break;
								ee = ee.next;
							} while (ee !== eeLast);

							if ((ee) && (ee.end == i) && (!ee.inverse)) {
								e.inverse = ee;
								ee.inverse = e;
							}
						}
					}
					e = e.next;
				} while (e != eLast);
			}

			return g;
		}
	}
}
