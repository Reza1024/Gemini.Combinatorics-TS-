module Gemini.Combinatorics {
	export class PlaneGraphEmbbeder {
		static embed(g: PlaneGraph, boundary: any, faceCenters: any, settings: PlaneGraphEmbbederSettings, outerFace: PlaneGraphFace) {
			const gClone = g.clone();
			gClone.ensureFacesComputed();

			outerFace = this.findOuterFaceInClone(gClone, settings, outerFace);
			PlaneGraphOperators.triangulateFaces(g, outerFace);
			return this.computeVerticesPosition(gClone, settings, outerFace, boundary, faceCenters);
		}

		private static findOuterFaceInClone(g: PlaneGraph, settings: PlaneGraphEmbbederSettings, outerFace: PlaneGraphFace) {
			if (outerFace)
				outerFace = g.faces[outerFace.index];
			else {
				outerFace = g.faces[0];
				if (settings.isOuterFaceBiggest) {
					g.faces.forEach((f) => {
						if (f.size > outerFace.size)
							outerFace = f;
					});
				}
				else {
					g.faces.forEach((f) => {
						if (f.size < outerFace.size)
							outerFace = f;
					});
				}
			}
			return outerFace;
		}

		private static computeVerticesPosition(g: PlaneGraph, settings: PlaneGraphEmbbederSettings, outerFace: PlaneGraphFace, boundary: any, faceCenters :any) {
			var a: number[][] = new Array(g.vertexCount);
			var b = new Array(g.vertexCount);
			for (var i = 0; i < g.vertexCount; i++) {
				a[i] = new Array(g.vertexCount);
				for (var j = 0; j < g.vertexCount; j++)
					a[i][j] = 0;
			}
			
			var addedVertices: boolean[] = new Array(g.vertexCount);
			var faceVertices = outerFace.vertices;
			var verticesBfs = [];
			var verticesBfsVisit = new Array(g.vertexCount);

			var startAngle = 0;
			var width = boundary.width;
			var height = boundary.height;
			var left = boundary.left;
			var top = boundary.top;

			if ((faceVertices.length >= 4) && (!settings.putOuterFaceOnCircle)) {
				var k = Math.floor(faceVertices.length / 4);
				var k1: number, k2: number, k3: number, k4: number;
				switch (faceVertices.length % 4) {
					case 0:
						k1 = k2 = k3 = k4 = k;
						break;
					case 1:
						k2 = k3 = k4 = k;
						k1 = k + 1;
						break;
					case 2:
						k1 = k3 = k;
						k2 = k4 = k + 1;
						break;
					case 3:
						k3 = k;
						k1 = k2 = k4 = k + 1;
						break;
				}

				var vi = 0;
				faceVertices.forEach((v) => {
					a[v][v] = 1;
					addedVertices[v] = true;
					vi++;
					verticesBfs.push(v);
					verticesBfsVisit[v] = 1;
				});

				var vi = faceVertices.length - 1;
				switch (faceVertices.length % 4) {
					case 0:
					//vi += k4;
					case 1:
						break;
					case 2:
						break;
					case 3:
						break;
				}

				vi += Math.floor(k1 / 2) + 1;
				var mod = faceVertices.length;
				for (var i = 0; i < k1; i++)
					b[faceVertices[vi-- % mod]] = [1.0 * i / k1, 0];
				for (var i = 0; i < k2; i++)
					b[faceVertices[vi-- % mod]] = [1, 1.0 * i / k2];
				for (var i = 0; i < k3; i++)
					b[faceVertices[vi-- % mod]] = [1 - 1.0 * i / k3, 1];
				for (var i = 0; i < k4; i++)
					b[faceVertices[vi-- % mod]] = [0, 1 - 1.0 * i / k4];
			}
			else {
				faceVertices.forEach((v, vi) => {
					a[v][v] = 1;
					b[v] = [
						(Math.sin(-2 * Math.PI * vi / outerFace.size + startAngle) + 1) * width / 2 + left,
						(1 - Math.cos(-2 * Math.PI * vi / outerFace.size + startAngle)) * height / 2 + top
					];
					if (b[v][0] < 0.000000001)
						b[v][0] = 0;
					if (b[v][1] < 0.000000001)
						b[v][1] = 0;
					addedVertices[v] = true;
					vi++;
					verticesBfs.push(v);
					verticesBfsVisit[v] = 1;
				});
			}

			for (var head = 0; head < verticesBfs.length; head++) {
				g.getNeighbours(verticesBfs[head]).forEach((n) => {
					if (!verticesBfsVisit[n]) {
						verticesBfsVisit[n] = verticesBfsVisit[head] + 1;
						verticesBfs.push(n);
					}
				});
			}

			for (var v = 0; v < g.vertexCount; v++) {
				if (addedVertices[v])
					continue;

				var sum = 0;
				g.getNeighbours(v).forEach((n) => {
					a[v][n] = 1;
					//a[v][n] = 1 * (g.vertexCount - verticesBfsVisit[n] + 1)* (g.vertexCount - verticesBfsVisit[n] + 1)* (g.vertexCount - verticesBfsVisit[n] + 1)* (g.vertexCount - verticesBfsVisit[n] + 1);
					//a[v][n] = Math.pow(3, -verticesBfsVisit[n] * verticesBfsVisit[n]);
					//a[v][n] = 1.0 / (verticesBfsVisit[n] * verticesBfsVisit[n] * verticesBfsVisit[n] * verticesBfsVisit[n]);
					sum += a[v][n];
				});

				a[v][v] = -sum;
				b[v] = [0, 0];
				addedVertices[v] = true;
			}

			var result = new Array(g.vertexCount);

			var matrixA = new Array(g.vertexCount);
			var matrixB = new Array(g.vertexCount);
			for (var i = 0; i < g.vertexCount; i++) {
				matrixA[i] = new Array(g.vertexCount);
				for (var j = 0; j < g.vertexCount; j++) {
					matrixA[i][j] = [a[i][j], 1];
				}
				var s0 = new String(b[i][0]);
				var b0;
				if (s0.indexOf(".") === -1)
					b0 = [b[i][0], 1];
				else if (s0.indexOf("e") === -1)
					b0 = float2frac(s0);
				else
					b0 = scientific2frac(s0);

				matrixB[i] = [b0];
			}

			var matrixX = solve_lineq(matrixA, matrixB);
			for (var i = 0; i < g.vertexCount; i++) {
				var x = matrixX[i][0][0] * 1.0 / matrixX[i][0][1];
				result[i] = [x, 0];
			}

			for (var i = 0; i < g.vertexCount; i++) {
				for (var j = 0; j < g.vertexCount; j++) {
					matrixA[i][j] = [a[i][j], 1];
				}
				var s1 = new String(b[i][1]);
				var b1;
				if (s1.indexOf(".") === -1)
					b1 = [b[i][1], 1];
				else if (s0.indexOf("e") === -1)
					b1 = float2frac(s1);
				else
					b1 = scientific2frac(s1);

				matrixB[i] = [b1];
			}

			var matrixY = solve_lineq(matrixA, matrixB);
			for (var i = 0; i < g.vertexCount; i++) {
				var y = matrixY[i][0][0] * 1.0 / matrixY[i][0][1];
				result[i][1] = y;
			}

			if (faceCenters) {
				var adjustmentIndex = 0;
				for (var i = 0; i < g.faceCount; i++) {
					var f = g.faces[i];

					if (f === outerFace) {
						faceCenters.push(null);
						adjustmentIndex--;
					}
					else if (f.size === 3) {
						faceCenters.push([
							(result[f.startEdge.start][0] + result[f.startEdge.end][0] + result[f.startEdge.inverse.prev.end][0]) / 3.0,
							(result[f.startEdge.start][1] + result[f.startEdge.end][1] + result[f.startEdge.inverse.prev.end][1]) / 3.0
						]);
						adjustmentIndex--;
					}
					else {
						faceCenters.push([
							matrixX[i + g.vertexCount + adjustmentIndex][0][0] * 1.0 / matrixX[i + g.vertexCount + adjustmentIndex][0][1],
							matrixY[i + g.vertexCount + adjustmentIndex][0][0] * 1.0 / matrixY[i + g.vertexCount + adjustmentIndex][0][1]
						]);
					}
				}
			}

			return result;
		}
	}
	export class PlaneGraphEmbbederSettings {
		isOuterFaceBiggest = true;
		putOuterFaceOnCircle = false;
	}
}
