module Gemini.Combinatorics {
	window.onload = () => {
		//var code = "4 2 3 4 0 1 4 3 0 1 2 4 0 1 3 2 0";
		var code = "7 2 3 4 0 1 4 5 6 7 3 0 1 2 7 4 0 1 3 7 5 2 0 2 4 7 6 0 2 5 7 0 2 6 5 4 3 0";
		//var code = "40 2 3 4 0 1 5 6 7 0 1 8 9 0 1 10 11 0 2 11 12 0 2 13 14 0 2 15 8 0 3 7 16 0 3 17 10 0 4 9 18 0 4 19 5 0 5 20 13 0 6 12 21 0 6 22 15 0 7 14 23 24 0 8 24 25 17 0 9 16 26 0 10 26 19 0 11 18 27 20 0 12 19 28 29 0 13 29 22 0 14 21 30 0 15 30 31 0 15 32 16 0 16 33 34 0 17 34 18 0 19 34 35 28 0 20 27 36 0 20 36 37 21 0 22 37 23 0 23 38 32 0 24 31 33 0 25 32 39 0 25 40 27 26 0 27 40 36 0 28 35 39 29 0 29 38 30 0 31 37 39 0 33 38 36 40 0 34 39 35 0";
		var g = PlaneGraph.fromIntCode(code);
		//var code = "[[1,2,3],[0,3,4,5,6,2],[0,1,6,3],[0,2,6,4,1],[1,3,6,5],[1,4,6],[1,5,4,3,2]]";
		//var g = PlaneGraph.fromAdjancecyList(JSON.parse(code));
		var boundary = new Drawings.Rect(0, 0, 500, 500);
		var faceCenters: Drawings.Point[] = [];
		var pos = PlaneGraphEmbeder.embed(
			g,
			boundary,
			faceCenters,
			new PlaneGraphEmbederSettings(),
			null);
		document.getElementById("content").innerHTML = PlaneGraphToSvg.convert(g, pos, boundary.width, boundary.height);
		document.getElementById("graphData").innerHTML = JSON.stringify(g.toAdjancecyList());
	};
}
