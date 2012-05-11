var xlinkNS="http://www.w3.org/1999/xlink", svgNS="http://www.w3.org/2000/svg";

var hexWidth = 1000;
var hexHeight = 866;

function getXY(col, row) {
	//Returns placement position for a grid reference.
	var x = ((0.75*col)+0.5)*hexWidth;
	var y = ((row+((col%2)*0.5))+0.5)*hexHeight;
	return [x,y]
}

function getRowColumn(hexagon) {
	//Returns where this hexagon is on the grid.
	var x = hexagon.getAttribute("x");
	var y = hexagon.getAttribute("y");
	var r = Math.floor((y-(hexHeight/2))/hexHeight);
	var c = Math.round(((x/hexWidth)-0.5)*1.333);
	return [c,r];
}

function genHexagon(col, row, colour, id) {
	//Create a hexagon at col,row specified colour, id is usually null.
	var pos = getXY(col, row);
	var newhex = document.createElementNS(svgNS, "use");
	newhex.setAttribute("id", id);
	newhex.setAttribute("x", pos[0]);
	newhex.setAttribute("y", pos[1]);
	newhex.setAttribute("fill", "url(#"+colour+")");
	newhex.setAttributeNS(xlinkNS, "href", "#hex");
	document.getElementById("hexes").appendChild(newhex);
	return newhex;
}

function drawDivider(hp, stroke, side) {
	//Draw a divider on the bottom of hexagon hp, stroke is colour, side is left/right/center
	var pos = getXY(hp[0], hp[1]);
	var newd = document.createElementNS(svgNS, "use");
	newd.setAttribute("x", pos[0]);
	newd.setAttribute("y", pos[1]);
	newd.setAttribute("stroke", stroke);
	newd.setAttributeNS(xlinkNS, "href", "#"+side);
	document.getElementById("joins").appendChild(newd);
}

function endMarker(h) {
	//Put the end marker above the hexagon h.
	var m = document.getElementById("e");
	m.setAttribute("cx", h.getAttribute("x"));
	m.setAttribute("cy", h.getAttribute("y"));
}

function fillId(thing) {
	//Returns the map description letter corresponding to the fill
	var c;
	if (thing == undefined) {
		c = startColour;
	} else {
		c = thing.getAttribute("fill");
	}
	return c.slice(5,6);
}

function playerMove(h, fill, record) {
	//Move the player to hexagon h, specified fill, record is whether to add to the route.
	var m = document.getElementById("p");
	var x, y;
	if (record) {
		var l = document.createElementNS(svgNS, "line");
		l.setAttribute("stroke", colourMap[fillId(m)]);
		x = m.getAttribute("cx");
		y = m.getAttribute("cy");
		l.setAttribute("x1", x);
		l.setAttribute("y1", y);
	}
	x = h.getAttribute("x");
	y = h.getAttribute("y");
	m.setAttribute("cx", x);
	m.setAttribute("cy", y);
	m.setAttribute("fill", fill);
	path.push(h);
	if (record) {
		l.setAttribute("x2", x);
		l.setAttribute("y2", y);
		document.getElementById("route").appendChild(l);
	}
}

function linkId(a, b) {
	//Get the identifier linking these points.
	if (a[1] == b[1]) {
		if (a[0] > b[0]) {
			return (a+b).toString()
		} else {
			if (a[0] < b[0]) {
				return (b+a).toString()
			}
		}
	} else {
		if (a[1] < b[1]) {
			return (a+b).toString()
		} else {
			return (b+a).toString()
		} 
	}
	return null
}

function genDivider(a, b, colour) {
	//Draws and creates an entry in joins for the line between grid positions a and b.
	var stroke = colourMap[colour];
	if (a[0] == b[0]) { //a on top of b
		drawDivider(a, stroke, "center");
	} else {
		if (b[1] == a[1]) { //Same Line
			if (a[0]%2) { //Odd Rows
				drawDivider(b, stroke, "left");
			} else { //Even Rows
				drawDivider(a, stroke, "right");
			}
		} else { //Line Below
			if (a[0] - b[0] == 1) {
				drawDivider(a, stroke, "left");
			} else {
				drawDivider(a, stroke, "right");
			}
		}
	}
	joins[linkId(a,b)] = colour;
}

function gridSize(c, r) {
	//Setup the viewbox for a maze of size cxr
	r = (r+0.5)*hexHeight;
	c = ((0.75*c)+0.25)*hexWidth;
	var g = document.getElementById("gameGrid");
	g.setAttribute("viewBox", "0 0 "+c.toString()+" "+r.toString());
}

function clearChildren(group) {
	//Remove all children of group.
	var p = document.getElementById(group);
	while (p.childNodes.length >= 1) {
		p.removeChild(p.firstChild);
	}
}

function loadMaze(maze) {
	var m = maze.maze;
	var i, j, c, hexpos, hex;
	//Clear existing drawing and globals
	joins = {};
	path = [];
	clearChildren("hexes");
	clearChildren("joins");
	clearChildren("route");
	if (maze.startColour == undefined) { //Default startColour to white
		maze.startColour = "w";
	}
	startColour = "url(#"+maze.startColour+")";
	//Setup
	gridSize(Math.ceil(m[0].length/2), Math.ceil(m.length/2));
	//Draw
	for (i=0; i<m.length; i++) {
		l = m[i].toLowerCase();
		if ((i+1)%2) { //Hexagon Line
			for (j=0; j<l.length; j++) {
				c = l[j];
				if (c == " ") { //Gaps in the maze and impasses
					continue;
				}
				if ((j+1)%2) {
					//Hexagon
					hexpos = [j/2, i/2].toString();
					switch (hexpos) {
						case maze.end:
							hex = "end";
							break;
						default:
							hex = null;
					}
					hex = genHexagon(j/2, i/2, c, hex);
					if (hexpos ==  maze.start) {
						playerMove(hex, startColour, false);
					}
					if (hexpos == maze.end) {
						endMarker(hex);
					}
				} else {
					//Divider
					if ((j+1)%4) {
						genDivider([(j-1)/2, i/2], [(j+1)/2, i/2], c);
					} else {
						genDivider([(j-1)/2, i/2], [(j+1)/2, i/2], c);
					}
				}
			}
		} else { //Divider Line
			for (j=0; j<l.length; j++) {
				c = l[j];
				if (c == " ") {
					continue;
				}
				if ((j+1)%2) {
					genDivider([j/2, (i-1)/2], [j/2, (i+1)/2], c);
				} else {
					if ((j+1)%4) {
						genDivider([(j+1)/2, (i-1)/2], [(j-1)/2, (i+1)/2], c);
					} else {
						genDivider([(j-1)/2, (i-1)/2], [(j+1)/2, (i+1)/2], c);
					}
				}
			}
		}
	}
}

function joinedBy(ha,hb) {
	//Return the boundary colour if adjacent, else undefined.
	var a = getRowColumn(ha);
	var b = getRowColumn(hb);
	return joins[linkId(a,b)];
}

var joins;
var path;
var startColour;

loadNextMaze();

function reset(evt) {
	//Restart current maze.
	playerMove(path[0], startColour, false);
	document.getElementById("route").setAttribute("display", "none"); //Hide Route (if shown)
	clearChildren("route");
	path = [path[0]];
}

function mazeComplete() {
	var route = document.getElementById("route")
	route.setAttribute("display", "inline"); //Show Path
	alert("Success");
	route.setAttribute("display", "none");
	loadNextMaze();
}

function hexClick(evt) {
	//Hexagon was clicked on (the game).
	var h; //Svg Use Element that got clicked
	h = evt.target.correspondingUseElement; //Standard
	if (h == undefined) {
		h = evt.target.parentElement; //Firefox
	}
	var pl = path.length; //Step number.
	var join = joinedBy(path[pl-1], h);
	if ((join != undefined) && ((join == fillId(path[pl-2])) || (join == "w") || (fillId(path[pl-2]) == "w"))) { //Valid step.
		playerMove(h, path[pl-1].getAttribute("fill"), true);
		if (h.getAttribute("id") == "end") {
			mazeComplete();
		}
	}
}