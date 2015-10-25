/**
	Matrix functions

	Copyright (C) 2001-2003 Borislav Manolov

	This program is free software; you can redistribute it and/or
	modify it under the terms of the GNU General Public License
	as published by the Free Software Foundation; either version 2
	of the License, or (at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU General Public License for more details.

	Author: Borislav Manolov
		b.manolov at the server gmail.com
		http://purl.org/NET/borislav
*/

/**************************************************************/
// matrix parsing
/**************************************************************/

function reduceWhitespaces(str) {
	// remove leading whitespaces
	str = str.substr( str.search(/\S/) )
	// remove carriage returns (CR)
	str = str.replace(/\r|\+/g, "");
	// convert tabs to a space
	str = str.replace(/\t/g, " ");

	// reduce spaces - more than one -> one
	str = str.replace(/ {2,}/g, " ");
	// reduce new lines - more than one -> one
	str = str.replace(/\n{2,}/g, "\n");
	// clear spaces at the beginning and the end of the rows
	str = str.replace(/ +\n+ +|\n+ +| +\n+/g, "\n");

	// remove ending whitespaces
	str = str.replace(/\s+$/g,"")
	return str;
}

/*****************************/

function parseMatrix(matrixStr) {
	matrixStr = reduceWhitespaces(matrixStr);
	if (
			// 1. no digits
			matrixStr.search( /\d/ ) == -1 ||
			// 2. other chars than digits, slashes, whitespaces, dots, dashes
			matrixStr.search( /[^0-9\/\s\.-]/ ) != -1 ||
			// 3. chars like '-/'
			matrixStr.search( /\-\// ) != -1 ||
			// 4. permutations of (/slash, dot) + d*
			// 	+ permutaions of (slash, dot, dash)
			matrixStr.search( /[\/\.]\d*[\/\.-]/ ) != -1 ||
			// 5. chars like '-d*-' ('d' means digit, * - 0 or more)
			matrixStr.search( /-\d*-/ ) != -1 ||
			// 6. lonely dot - ' . '
			matrixStr.search( /\s\.\s|\s\.$/ ) != -1 ||
			// 7. lonely minus - ' - '
			matrixStr.search( /\s-\s|\s-$/ ) != -1 ||
			// 8. non-digit + slash + one or more non-digits - 'D/D*'
			matrixStr.search( /\D\/\D*/ ) != -1 ||
			// 9. chars like 'dd-'
			matrixStr.search( /\d+-/ ) != -1
	) {

		errorMsg('The matrix is empty or it contains non-digits.');
		return false;
	}

	var tempRows = matrixStr.split("\n")
	var matrix = new Array();
	matrix[0] = tempRows[0].split(" ");
	var tempFrac = new Array(2); // numerator & denominator
	var tmp = "";

	for (var j=0; j < matrix[0].length; j++) {
		tmp = matrix[0][j];
		if (tmp.indexOf(".") != -1) {
			if (tmp.indexOf("e") != -1)
				matrix[0][j] = scientific2frac(tmp);
			else
				matrix[0][j] = float2frac(tmp);
		} else {
			if (tmp.indexOf("/") == -1) {
					tmp += "/";
			}
			tempFrac = tmp.split("/");
			if (tempFrac[1] == "" || parseInt(tempFrac[1]) == 0)
					tempFrac[1] = 1;
			matrix[0][j] = tempFrac;
		}
	}

	for (var i=1; i < tempRows.length; i++) {
		matrix[i] = tempRows[i].split(" ");
		if (matrix[i].length != matrix[i-1].length) {
			errorMsg('Different rows have different number of elements.\n\n'
					+ 'row ' + i + ' = ' + matrix[i-1].length + ' elements\n'
					+ 'row ' + (i+1) + ' = ' + matrix[i].length + ' elements\n');
			return false;
		}
		for (var j=0; j < matrix[i].length; j++) {
			tmp = matrix[i][j];
			if (tmp.indexOf(".") != -1) {
				if (tmp.indexOf("e") != -1)
					matrix[i][j] = scientific2frac(tmp);
				else
					matrix[i][j] = float2frac(tmp);
			} else {
				if (tmp.indexOf("/") == -1) {
					tmp += "/";
				}
				tempFrac = tmp.split("/");
				if (tempFrac[1] == "" || parseInt(tempFrac[1]) == 0)
					tempFrac[1] = 1;
				matrix[i][j] = tempFrac;
			}
		}
	}
	return matrix;
}


function scientific2frac(scientificNum) {
	var str = String(scientificNum);
	var sign = str.charAt(0) == '-' ? -1 : 1;
	var point = str.indexOf(".");
	var e = str.indexOf("e");
	var firstDigit = str.charAt(point - 1);
	var integ = parseInt(firstDigit + str.substring(point + 1, e));
	if (isNaN(integ))
		integ = 0;

	var power = parseInt(str.substring(e + 1)) - (e - point - 1);

	return normalizeFrac(
		new Array(
				sign * integ,
				Math.pow(10, -power)));
}

function float2frac(floatNum) {
	var str = String(floatNum);
	var sign = str.charAt(0) == '-' ? -1 : 1;
	var point = str.indexOf(".");
	var integ = parseInt( str.substring(0, point) );
	if (isNaN(integ))
		integ = 0;

	var frac_str = str.substr(point+1);
	var fracLen = frac_str.length;
	var frac = parseInt(frac_str, 10);
	if (isNaN(frac)) {
		frac = 0;
		denom = 1;
	} else {
		denom = Math.pow(10, fracLen);
	}

	return normalizeFrac(
		new Array(
				denom * integ + sign * frac,
				denom) );
}


/**************************************************************/
// matrix arithmetic
/**************************************************************/

function multiplyMatr(matrixA, matrixB) {
	var rowsA = matrixA.length;
	var rowsB = matrixB.length; // == colsA
	var colsB = matrixB[0].length;
	var matrixC = new Array(rowsA);

	for (var i=0; i < rowsA; i++) {
		matrixC[i] = new Array(colsB);
	}

	for (var k=0; k < colsB; k++) {
		for (var i=0; i < rowsA; i++) {
			var temp = new Array(0,1);
			for (var j=0; j < rowsB; j++) {
				temp =
					addFracs( temp, multFracs(matrixA[i][j], matrixB[j][k]) );
			}
			matrixC[i][k] = temp;
		}
	}
	return matrixC;
}


/****************************************************/

function addMatr(matrixA, matrixB) {
	var rowsA = matrixA.length; // == rowsB
	var colsA = matrixA[0].length; // == colsB
	var matrixC = new Array(rowsA);

	for (var i=0; i < rowsA; i++) {
		matrixC[i] = new Array(colsA);
		for (var j=0; j < colsA; j++) {
			matrixC[i][j] = addFracs(matrixA[i][j], matrixB[i][j]);
		}
	}
	return matrixC;
}


/****************************************************/

function isSquare(matrix) {
	return matrix.length == matrix[0].length;
}

/****************************************************/

function isRegular(matrix) {
	if (!isSquare(matrix)) {
		errorMsg('The matrix is not square.');
		return false;
	}
	var rows = matrix.length;

	nextRow:
	for (var i=0; i < rows; i++) {
		for (var j=0; j < rows; j++) {
			if (matrix[j][i][0] != 0) {
				continue nextRow;
			}
		}
		errorMsg('The matrix is singular.');
		return false;
	}
	return true;
}



/**************************************************************/
// public functions
/**************************************************************/

function doMatrMult_AB(matrixA, matrixB) {
	matrixA = parseMatrix(matrixA);
	if (matrixA == false)
		return false;
	matrixB = parseMatrix(matrixB);
	if (matrixB == false)
		return false;

	if (canBeMult(matrixA, matrixB)) {
		return multiplyMatr(matrixA, matrixB);
	} else {
		errorMsg('The columns of the first matrix must be equal to the rows '
				+ 'of the second one.\nThey can not be multiplied.');
		return false;
	}
}

/****************************************************/

function doMatrMult_ABA(matrixA, matrixB) {
	matrixA = parseMatrix(matrixA);
	if (matrixA == false)
		return false;
	matrixB = parseMatrix(matrixB);
	if (matrixB == false)
		return false;
	if (canBeMult(matrixA, matrixB) && canBeMult(matrixB, matrixA) ) {
		return multiplyMatr( multiplyMatr(matrixA, matrixB),
												matrixA );
	} else {
		errorMsg('The columns of the first matrix must be equal to the rows '
				+ 'of the second one and the columns of the second matrix '
				+ 'must be equal to the rows of the first one.\n'
				+ 'They can not be multiplied.');
		return false;
	}
}


function canBeMult(matrixA, matrixB) {
	var colsA = matrixA[0].length;
	var rowsB = matrixB.length;
	if (colsA != rowsB) {
		return false;
	}
	return true;
}

/****************************************************/

function powMatr(matrix) {
	matrix = parseMatrix(matrix);
	if (matrix == false)
		return false;
	if (canBeMult(matrix, matrix)) {
		return multiplyMatr(matrix, matrix);
	} else {
		errorMsg('The matrix must be square.\nIt can not be powered.');
		return false;
	}
}

/****************************************************/

function doMatrAdd(matrixA, matrixB) {
	matrixA = parseMatrix(matrixA);
	if (matrixA == false)
		return false;
	matrixB = parseMatrix(matrixB);
	if (matrixB == false)
		return false;

	if (canBeAdd(matrixA, matrixB)) {
		return addMatr(matrixA, matrixB);
	} else {
		errorMsg('The dimensions of the matrices are different. \n'
				+ 'They can not be added.');
		return false;
	}
}


function canBeAdd(matrixA, matrixB) {
	if (
			matrixA.length != matrixB.length ||
			matrixA[0].length != matrixB[0].length
	) {
		return false;
	}
	return true;
}


/**************************************************************/
// matrix.toString()
/**************************************************************/

function matr2str(matrix) {
	var str = "";
	var maxNumer = getMaxDigits(matrix, 0);
	var maxDenom = getMaxDigits(matrix, 1);
	var diff = 0;

	for (var i=0; i < matrix.length; i++) {
		for (var j=0; j < matrix[0].length; j++) {
			if (matrix[i][j][0] == undefined ||
					matrix[i][j][1] == undefined) {
						errorMsg("Undefined element at [" + i +"]["+ j+"]");
			}
			diff = maxNumer - matrix[i][j][0].toString().length;
			for (var k=0; k < diff; k++) {
				str += " ";
			}
			str += matrix[i][j][0];
			if (matrix[i][j][1] != 1 && matrix[i][j][0] != 0) {
				str += "/" + matrix[i][j][1];
			} else {
				str += "  ";
			}
			diff = maxDenom - matrix[i][j][1].toString().length;
			for (var k=0; k < diff+1; k++)
				str += " ";
		}
		str += "\n";
	}
	return str;
}


function getMaxDigits(matrix, index){
	var max = 0;
	var temp = 0;
	for (var i=0; i < matrix.length; i++) {
		for (var j=0; j < matrix[0].length; j++) {
			temp = matrix[i][j][index].toString().length;
			if (temp > max)
				max = temp;
		}
	}
	return max;
}


function getTranspose(matrix) {
	var rows = matrix.length;
	var cols = matrix[0].length;
	var transpose = new Array(cols);
	for (var i=0; i < cols; i++) {
		transpose[i] = new Array(rows);
		for (var j=0; j < rows; j++) {
			transpose[i][j] = matrix[j][i];
		}
	}
	return transpose;
}

/**************************************************************/
// LU Decomposition
/**************************************************************/

function decomposeLU(matrix) {

	var dim = matrix.length;
	// permutation matrix
	var permMatr = getIdentMatr(dim);
	var quotient = new Array(1, 1);
	var found = false;
	for (var k = 0; k < dim-1; k++) {
		for (var i = k+1; i < dim; i++) {
			if (matrix[k][k][0] == 0) {
				for (var p = k+1; p < dim; p++) {
					if (matrix[p][k][0] != 0) {
						matrix = swapRows(matrix, k, p);
						permMatr = swapRows(permMatr, k, p);
						found = true;
					}
				}
				if (!found) {
					errorMsg('The matrix is singular.');
					return false;
				}
			}
			quotient = divFracs(matrix[i][k], matrix[k][k]);
			matrix[i][k] = quotient;
			for (var j = k+1; j < dim; j++) {
				matrix[i][j] =
					subFracs( matrix[i][j], multFracs(quotient, matrix[k][j]) );
			}
		}
	}
	var matrices = extractLU(matrix);
	matrices['P'] = permMatr;
	return matrices;
}

/****************************************************/

function getIdentMatr(dim) {
	var identMatr = new Array(dim);

	for (var i=0; i < dim; i++) {
		identMatr[i] = new Array(dim);
		for (var j=0; j < dim; j++) {
			identMatr[i][j] = new Array(2);
			identMatr[i][j][0] = i == j ? 1 : 0;
			identMatr[i][j][1] = 1;
		}
	}
	return identMatr;
}

/****************************************************/

function extractLU(matrixLU) {
	var dim = matrixLU.length;
	var matrixL = new Array(dim);
	var matrixU = new Array(dim);

	for (var i=0; i < dim; i++) {
		matrixL[i] = new Array(dim);
		matrixU[i] = new Array(dim);
	}

	for (var i=0; i < dim; i++) {
		for (var j=0; j <= i; j++) {
			matrixL[j][i] = new Array(0, 1);
			matrixU[j][i] = matrixLU[j][i];
		}
	}

	for (var i=1; i < dim; i++) {
		for (var j=0; j < i; j++) {
			matrixL[i][j] = matrixLU[i][j];
			matrixU[i][j] = new Array(0, 1);
		}
	}

	for (var i=0; i < dim; i++) {
		matrixL[i][i] = new Array(1, 1);
	}

	var matrices = new Array();
	matrices['L'] = matrixL;
	matrices['U'] = matrixU;
	return matrices;
}


// solve system of linear equations
function solve_lineq(coefs, vec) {
	if (coefs.length != vec.length) {
		errorMsg('The dimension of the right-side vector must be '+
			'equal to the dimensions of the coefficient matrix, i.e. '+
			'if the matrix is 3x3 then the vector must have 3 elements.');
		return false;
	}
	var matrices = decomposeLU(coefs);
/* alert('== L ==\n'+matr2str(matrices['L'])+
	'\n---\n== U ==\n'+matr2str(matrices['U']));*/
	var y = solve_lineq_ltm(matrices['L'], multiplyMatr(matrices['P'], vec));
	return solve_lineq_utm(matrices['U'], y);
}


// solve system of linear equations using an upper triangular matrix
function solve_lineq_utm(utm, vec) {
	var dim = vec.length;
	var solut = new Array(dim);

	for (var i = dim-1; i >= 0; i--) {
		var right = vec[i][0];
		for (var k = i+1; k < dim; k++) {
			right =
				subFracs(right, multFracs(utm[i][k], solut[k][0]));
		}
		solut[i] = new Array(1);
		solut[i][0] = divFracs(right, utm[i][i]);
	}

	return solut;
}


// solve system of linear equations using an lower triangular matrix
function solve_lineq_ltm(ltm, vec) {
	var dim = vec.length;
	var solut = new Array(dim);
	for (var i = 0; i < dim; i++) {
		var right = vec[i][0];
		for (var k = i-1; k >= 0; k--) {
			right = subFracs(right, multFracs(ltm[i][k], solut[k][0]));
		}
		solut[i] = new Array(1);
		solut[i][0] = divFracs(right, ltm[i][i]);
	}

	return solut;
}


/***********************************************************/

function clearFileds() {
	for (var i = 0; i < clearFileds.arguments.length; i++) {
		clearFileds.arguments[i].value = "";
	}
}

/****************************************************/

function swapRows(matrix, rowA, rowB) {
	var tmp = matrix[rowA];
	matrix[rowA] = matrix[rowB];
	matrix[rowB] = tmp;
	return matrix;
}

/****************************************************/

function errorMsg(msg) {
	alert("Error: \n" + msg);
}

/**************************************************************/
// Basic functions
/**************************************************************/

// @return great common divisor of a and b
function gcd(a, b) {
	if (a == 0 || b == 0) return 1;
	a = Math.abs(a);
	b = Math.abs(b);
	if (a < b) {
			var tmp = b;
			b = a;
			a = tmp;
	}
	var rest = 1;
	while ( (rest = a%b) != 0) {
			a = b;
			b = rest;
	}
	return b;
}

/****************************************************/

// @return least common multiple of a and b
function lcm(a, b) {
	return a*b / gcd(a, b);
}

/****************************************************/

function sig(i) {
	return i < 0 ? -1 : 1;
}

/****************************************************/

/*
	@return (frac1 + frac2), i.e.
	2        3        7
	---  +  ----  =  ----
	5       10       10
*/
function addFracs(frac1, frac2) {
	checkFracs(frac1, frac2);
	if (frac1[0] == 0)
		return normalizeFrac(frac2);
	else if (frac2[0] == 0)
		return normalizeFrac(frac1);
	else if (frac1[1] == 0 || frac2[1] == 0) {
		errorMsg("addFracs(): Denominator is 0.");
		return false;
	}

	return normalizeFrac(
		new Array(
				frac1[0] * frac2[1] + frac1[1] * frac2[0],
				frac1[1] * frac2[1] ));
}

/****************************************************/

function subFracs(frac1, frac2) {
	return addFracs(frac1, new Array(-1*frac2[0], frac2[1]));
}

/****************************************************/

/*
	@return frac1 x frac2,
	2        3        3
	---  x  ----  =  ----
	5       10       25
*/
function multFracs(frac1, frac2) {
	checkFracs(frac1, frac2);
	if (frac1[0] == 0 || frac2[0] == 0)
		return new Array(0,1);
	else if (frac1[1] == 0 || frac2[1] == 0) {
		errorMsg("multFracs(): Denominator is 0.");
		return false;
	}
	return normalizeFrac(
		new Array(
				frac1[0] * frac2[0],
				frac1[1] * frac2[1] ));
}

/****************************************************/

function divFracs(frac1, frac2) {
	return multFracs(frac1, reciprocal(frac2));
}

/****************************************************/

function reciprocal(frac) {
	if (frac[0] == 0) {
		return new Array(0, 1);
	}
	return new Array(frac[1] * sig(frac[0]), Math.abs(frac[0]));
}

/****************************************************/

function checkFracs(frac1, frac2) {
	for (var i=0; i<2; i++) {
		if (isNaN(frac1[i]) || isNaN(frac2[i])) {
			errorMsg("Either of the fractions is NaN.");
			return false;
		}
	}
	return true;
}

/****************************************************/

function normalizeFrac(frac) {
	var _gcd = gcd(frac[0], frac[1]);
	frac[0] /= _gcd; // numerator
	frac[1] /= _gcd; // denominator
	return frac;
}
