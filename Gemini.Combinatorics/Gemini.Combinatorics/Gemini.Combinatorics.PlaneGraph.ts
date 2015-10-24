/**
* Gemini Library v1.0.0
* http://www.jooyandeh.com/
* Copyright 2015, Reza Jooyandeh
*
* All rights reserved. Permission is hereby given for use and/or distribution
* with the exception of sale for profit or application with non military
* significance. You must not remove this copyright notice, and you must
* document any changes that you make to this program. This software is subject
* to this copyright only, irrespective of any copyright attached to any package
* of which this is a part. Absolutely no guarantees or warranties are made
* concerning the suitability, correctness, or any other aspect of this program.
* Any use is at your own risk.
*/

module Gemini {
	module Combinatorics {
		class PlaneEdge {
			start: number;
			end: number;
			index: number;
			rightFace: number;
			next: PlaneEdge;
			prev: PlaneEdge;
			inverse: PlaneEdge;
			private _isMarked: boolean;

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

		class Face {
			index: number;
			startEdge: PlaneEdge;
			size: number;

			get edges() {
				const edges = new PlaneEdge[this.size];
				let e = this.startEdge;
				do {
					edges.push(e);
					e = e.nextOnFace;
				} while (e !== this.startEdge);

				return edges;
			}

			get vertices() {
				const vertices = new Number[this.size];
				let e = this.startEdge;
				do {
					vertices.push(e.start);
					e = e.nextOnFace;
				} while (e !== this.startEdge);

				return vertices;
			}
		}

		class PlaneGraph {
			vertexCount: number;
			edgeCount: number;
			faceCount: number;
			edges: PlaneEdge[];
			firstEdge: PlaneEdge[];
			degrees: number[];
			faces: Face[];

			get hasLoop() {
				const edges = this.edges;
				for (let i in edges) {
					if (edges.hasOwnProperty(i)) {
						const e = edges[i];
						if (e.start === e.end)
							return true;
					}
				}
				return false;
			}

			ensureFacesComputed() {
				if (this.faces)
					return;

				this.faces = new Face[2 - this.vertexCount + this.edgeCount / 2];

				this.resetMarks();

				this.faceCount = 0;

				for (let i = 0; i < this.vertexCount; i++) {
					const firstEdge = this.firstEdge[i];
					let e = firstEdge;
					do {
						if (!e.isMarked) {
							const f = new Face();
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
					var eClone = new PlaneEdge();
					eClone.start = e.start;
					eClone.end = e.end;
					eClone.index = i;
					g.edges[i] = eClone;
				}

				for (var i = 0; i < this.edgeCount; i++) {
					var e = g.edges[i];
					const eOld = this.edges[e.index];
					e.next = g.edges[eOld.next.index];
					e.prev = g.edges[eOld.prev.index];
					e.inverse = g.edges[eOld.inverse.index];
				}

				for (let v = 0; v < this.vertexCount; v++) {
					g.degrees[v] = this.degrees[v];
					g.firstEdge[v] = g.edges[this.firstEdge[v].index];
				}

				return g;
			}

			resetMarks() {
				const edges = this.edges;
				for (let i in edges) {
					if (edges.hasOwnProperty(i)) {
						edges[i].isMarked = false;
					}
				}
			}

			getNeighbours(v: number) {
				const neighbours = new Number[this.degrees[v]];
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
						var e = new PlaneEdge();
						e.start = i;
						e.end = neighbour;
						e.prev = prevEdge;

						if (prevEdge)
							prevEdge.Next = e;
						else
							g.firstEdge[i] = e;

						prevEdge = e;

						g.edges.push(e);
						g.edgeCount++;
						g.degrees[i]++;
					}

					codeIndex++;
					prevEdge.Next = g.firstEdge[i];
					g.firstEdge[i].prev = prevEdge;
				}
			}
		}
	}
}
