var game;

function loadSet(ms, progress) {
	//Constructs a mazeSet object
	this.nMazes = ms.mazes.length;
	if (progress == null) {
		//Generate the progress data structure
		function genProgress(mazes) { //This insane construction exists because you can't delete a local variable
			var m, i, s;
			progress = [];
			for (m = 0; m < mazes.length; m++) {
				s = "";
				for (i = 0; i <= mazes[m].nEnds; i++)
					s += "n";
				progress.push(s);
			}
			return progress;
		}
		progress = genProgress(ms.mazes);
	}
	function genMeta() {
		//Generate metaMaze and hexLocs (if first run)
		var dohl, line, c, ml, x, y, count = 0, mm = [];
		(hexLocs.length == 0) ? dohl = true : dohl = false;
		for (y = 0; y < ms.mazeLayout.length; y++) {
			ml = "";
			line = ms.mazeLayout[y];
			for (x = 0; x < line.length; x++) {
				c = line[x];
				if (c == "?") {
					ml += progress[count++][0];
					if (dohl) {
						hexLocs.push([x/2, y/2]);
					}
				} else {
					ml += c;
				}
			}
			mm.push(ml);
		}
		ms.maze = mm;
	}
	var hexLocs = [];
	this.finishChange = function(evt) {
		//Callback for clicking the coloured circles
		//Update hexagon
		//Update progress
		//Update metaMaze?
	}
	//this.drawFinishColours = function() {
	//	//Draw on some finish colour circles
	//	var loc, cols;
	//	for (i = 0; i++; i < this.nMazes) {
	//		loc = this.hexLocs[i];
	//		cols = progress[i][1:];
	//	}	
	//}
	this.playing;
	this.completeCallback = function(col) {
		//When maze has been completed
		game.cleanup();
		var pstr = progress[this.playing].slice(1); //Completed colours section of string
		if (pstr.indexOf(col) == -1) { //Hasn't been completed this colour before
			var nstr;
			nstr = pstr.slice(0, pstr.indexOf("n")) + col;
			while (nstr.length < pstr.length) {
				nstr += "n";
			}
			if (pstr[0] == "n") {
				progress[this.playing] = col+nstr;
			} else {
				progress[this.playing] = pstr[0]+nstr;
			}
		}
		this.showMenu();
	}
	mazeComplete = this.completeCallback;
	this.completeMeta = function(col) {
		mazeComplete = this.completeCallback;
		alert("Congrats!");
		game.cleanup();
		this.showMenu();
	}
	this.menuHexClick = function(h) {
		//Play the corresponding maze
		var i, loc;
		loc = h.id.slice(1);
		for (i=0; i<hexLocs.length; i++) {
			if (hexLocs[i].toString() == loc) {
				break;
			}
		}
		this.playing = i;
		if (i < hexLocs.length) {
			gameStandard(ms.mazes[i]);
		} else if (loc == ms.start) {
			mazeComplete = this.completeMeta;
			gameStandard(ms);
		}
	}
	this.showMenu = function() {
		//Draw the level select menu
		genMeta();
		loadMaze(ms.maze);
		hexClick = [this, this.menuHexClick];
	}
	this.showMenu()
}

//To instanciate
mazeSet = new loadSet(msd, null);
