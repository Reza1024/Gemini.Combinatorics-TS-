module Gemini.Combinatorics {
	export class PlaneGraphToSvg {
		static convert(graph: PlaneGraph, positions: Drawings.Point[], width: number, height: number) {
			const svg = [];
			svg.push("<svg width=\"", width.toString(), "\" height=\"", height.toString(), "\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">", "\n\n\t<!-- Edges -->\n\n");

			svg.push("\t<g style=\"stroke:rgb(0,0,0);stroke-width:1\">\n");
			graph.edges.forEach((e) => {
				svg.push("\t\t<line x1=\"", positions[e.start].x.toString(), "\" y1=\"", positions[e.start].y.toString(), "\" x2=\"", positions[e.end].x.toString(), "\" y2=\"", positions[e.end].y.toString(), "\" />\n");
			});
			svg.push("\t</g>\n");

			svg.push("\n\n\t<!-- Vertices -->\n\n");
			svg.push("\t<g style=\"fill:rgb(255,200,100);stroke:rgb(0,0,0);stroke-width:1\">\n");
			for (let v = graph.vertexCount - 1; v >= 0; v--) {
				svg.push("\t\t<circle cx=\"", positions[v].x, "\" cy=\"", positions[v].y, "\" r=\"2\" />\n");
			}
			svg.push("\t</g>\n");

			svg.push("</svg>\n");

			return svg.join("");
		}
	}
}