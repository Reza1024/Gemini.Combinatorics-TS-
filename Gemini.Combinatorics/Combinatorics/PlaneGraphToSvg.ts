module Gemini.Combinatorics {
	export class PlaneGraphToSvg {
		static convert(graph: PlaneGraph, positions: any, width: number, height: number) {
			const svg = [];
			svg.push("<svg width=\"", width.toString(), "\" height=\"", height.toString(), "\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">", "\n\n\t<!-- Edges -->\n\n");

			svg.push("\t<g style=\"stroke:rgb(0,0,0);stroke-width:1\">\n");
			graph.edges.forEach((e) => {
				svg.push("\t\t<line x1=\"", positions[e.start][0].toString(), "\" y1=\"", positions[e.start][1].toString(), "\" x2=\"", positions[e.end][0].toString(), "\" y2=\"", positions[e.end][1].toString(), "\" />\n");
			});
			svg.push("\t</g>\n");

			svg.push("\n\n\t<!-- Vertices -->\n\n");
			svg.push("\t<g style=\"fill:rgb(255,200,100);stroke:rgb(0,0,0);stroke-width:1\">\n");
			for (let v = graph.vertexCount - 1; v >= 0; v--) {
				svg.push("\t\t<circle cx=\"", positions[v][0], "\" cy=\"", positions[v][1], "\" r=\"2\" />\n");
			}
			svg.push("\t</g>\n");

			svg.push("</svg>\n");

			return svg.join("");
		}
	}
}