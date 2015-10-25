module Gemini.Combinatorics {
	export class PlaneGraphOperators {
		static insertEdgeRightAfter(newEdge: PlaneEdge, e: PlaneEdge) {
			newEdge.next = e.next;
			newEdge.prev = e;
			newEdge.next.prev = newEdge;
			newEdge.prev.next = newEdge;
		}
		static triangulateFaces(g: PlaneGraph, exceptFace: PlaneGraphFace) {
			g.ensureFacesComputed();
			g.faces.forEach((f) => {
				if ((f === exceptFace) || (f.size === 3))
					return;

				var v = g.vertexCount;
				var lastFromV = null;
				var d = 0;
				f.edges.forEach((e) => {
					var toV = new PlaneEdge(e.start, v);
					PlaneGraphOperators.insertEdgeRightAfter(toV, e);
					g.degrees[toV.start]++;

					var fromV = new PlaneEdge(v, e.start);
					fromV.prev = lastFromV;
					if (lastFromV != null)
						lastFromV.next = fromV;
					else
						g.firstEdge.push(fromV);
					lastFromV = fromV;
					d++;
					g.edges.push(toV);
					g.edges.push(fromV);
					toV.inverse = fromV;
					fromV.inverse = toV;
				});

				g.degrees.push(d);
				lastFromV.Next = g.firstEdge[v];
				g.firstEdge[v].prev = lastFromV;
				g.vertexCount++;
			});
		}
	}
}