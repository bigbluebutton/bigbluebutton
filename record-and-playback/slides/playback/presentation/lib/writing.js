// - - - START OF GLOBAL VARIABLES - - - //
"use strict";

function getUrlParameters() {
    var map = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) { map[key] = value; });
    return map;
}

var params = getUrlParameters();
var MEETINGID = params.meetingId;
var HOST = window.location.hostname;
var url = "http://" + HOST + "/presentation/" + MEETINGID;
var shapes_svg = url + '/shapes.svg';
var events_xml = url + '/panzooms.xml';
var cursor_xml = url + '/cursor.xml';
//immediately load the content
document.getElementById("svgobject").setAttribute('data', shapes_svg);
//current time
var t;
var len;

//coordinates for x and y for each second
var panAndZoomTimes = [];
var viewBoxes = [];
var coords = [];
var times = [];
var clearTimes = [];
var main_shapes_times = [];
var vboxValues = {};
var cursorValues = {};
var imageAtTime = {};
var cursorStyle;

var svgobj = document.getElementById("svgobject");
var svgfile;
if(svgobj.contentDocument) svgfile = svgobj.contentDocument.getElementById("svgfile");
else svgfile = svgobj.getSVGDocument('svgfile');

//making the object for requesting the read of the XML files.
if (window.XMLHttpRequest) {
	// code for IE7+, Firefox, Chrome, Opera, Safari
	var	xmlhttp = new XMLHttpRequest();
} else {
	// code for IE6, IE5
	var xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
}

// PROCESS SHAPES.SVG (in XML format).
xmlhttp.open("GET", shapes_svg, false);
xmlhttp.send();
var xmlDoc = xmlhttp.responseXML;
//getting all the event tags
var shapeelements = xmlDoc.getElementsByTagName("svg");

//get the array of values for the first shape (getDataPoints(0) is the first shape).
var array = shapeelements[0].getElementsByClassName("shape"); //get all the lines from the svg file
//var pages = shapeelements[0].getElementsByClassName("page");
var images = shapeelements[0].getElementsByTagName("image");

//console.log(images);

//fill the times array with the times of the svg images.
for (var j = 0; j < array.length; j++) {
	times[j] = array[j].getAttribute("id").substr(4);
}
/*
for (var k = 0; k < pages.length; k++) {
	clearTimes[k] = [pages[k].getAttribute("in"), pages[k].getAttribute("out"), pages[k].getAttribute("image"), pages[k].getAttribute("id")];
}
*/
var times_length = times.length; //get the length of the times array.

for(var m = 0; m < images.length; m++) {
	len = images[m].getAttribute("in").split(" ").length;
	for(var n = 0; n < len; n++) {
		imageAtTime[[images[m].getAttribute("in").split(" ")[n], images[m].getAttribute("out").split(" ")[n]]] = images[m].getAttribute("id");
	}
}

// PROCESS PANZOOMS.XML
xmlhttp.open("GET", events_xml, false);
xmlhttp.send();
xmlDoc = xmlhttp.responseXML;
//getting all the event tags
var panelements = xmlDoc.getElementsByTagName("recording");
var panZoomArray = panelements[0].getElementsByTagName("event");
viewBoxes = xmlDoc.getElementsByTagName("viewBox");

var pzlen = panZoomArray.length;
var second_val;
//fill the times array with the times of the svg images.
for (var k = 0;k < pzlen; k++) {
	if(panZoomArray[k+1] == undefined) {
		second_val = "end";
	}
	else second_val = panZoomArray[k+1].getAttribute("timestamp");
	vboxValues[[panZoomArray[k].getAttribute("timestamp"), second_val]] = viewBoxes[k].childNodes[0].data;
}


// PROCESS CURSOR.XML
xmlhttp.open("GET", cursor_xml, false);
xmlhttp.send();
xmlDoc = xmlhttp.responseXML;
//getting all the event tags
var curelements = xmlDoc.getElementsByTagName("recording");
var cursorArray = curelements[0].getElementsByTagName("event");
coords = xmlDoc.getElementsByTagName("cursor");

var clen = cursorArray.length;
//fill the times array with the times of the svg images.
if(cursorArray.length != 0) cursorValues[[0, cursorArray[0].getAttribute("timestamp")]] = "0 0";
for (var m = 0; m < clen; m++) {
	if(cursorArray[m+1] == undefined) {
		second_val = "end";
	}
	else second_val = cursorArray[m+1].getAttribute("timestamp");
	cursorValues[[cursorArray[m].getAttribute("timestamp"), second_val]] = coords[m].childNodes[0].data;
}

// - - - END OF GLOBAL VARIABLES - - - //

// - - - START OF JAVASCRIPT FUNCTIONS - - - //

// Draw the cursor at a specific point
function draw(x, y) {
	cursorStyle = document.getElementById("cursor").style;
    //move to the next place
    cursorStyle.left = (parseInt(document.getElementById("slide").offsetLeft, 10) + parseInt(x, 10)) + "px";
    cursorStyle.top = (parseInt(document.getElementById("slide").offsetTop, 10) + parseInt(y, 10)) + "px";
}

// Shows or hides the cursor object depending on true/false parameter passed.
function showCursor(boolVal) {
	cursorStyle = document.getElementById("cursor").style;
    if(boolVal === false) {
        cursorStyle.height = "0px";
        cursorStyle.width = "0px";
    }
    else {
        cursorStyle.height = "10px";
        cursorStyle.width = "10px";
    }
}

function setViewBox(val) {
	svgfile = svgobj.contentDocument.getElementById("svgfile");
	svgfile.setAttribute('viewBox', val);
}

function setCursor(val) {
	draw(val[0], val[1]);
}

function getImageAtTime(time) {
	var curr_t = parseFloat(time);
	var key;
	for (key in imageAtTime) {
		if(imageAtTime.hasOwnProperty(key)) {
			var arry = key.split(",");
			if ((parseFloat(arry[0]) <= curr_t) && (parseFloat(arry[1]) >= curr_t)) {
				return imageAtTime[key];
			}
		}
	}
}

function getViewboxAtTime(time) {
	var curr_t = parseFloat(time);
	var key;
	for (key in vboxValues) {
		if(vboxValues.hasOwnProperty(key)) {
			var arry = key.split(",");
			if(arry[1] == "end") {
				return vboxValues[key];
			}
			else if ((parseFloat(arry[0]) <= curr_t) && (parseFloat(arry[1]) >= curr_t)) {
				return vboxValues[key];
			}
		}
	}
}

function getCursorAtTime(time) {
	var curr_t = parseFloat(time);
	var key;
	for (key in cursorValues) {
		if(cursorValues.hasOwnProperty(key)) {
			var arry = key.split(",");
			if (((parseFloat(arry[0]) <= curr_t) && (parseFloat(arry[1]) >= curr_t)) || (arry[1] == "end")) {
				return cursorValues[key].split(' ');
			}
		}
	}
}

// - - - END OF JAVASCRIPT FUNCTIONS - - - //

window.onresize = function(event) {
	svgobj.style.left = document.getElementById("slide").offsetLeft + "px";
    svgobj.style.top = "8px";
};

var current_canvas = "canvas0";
var current_image = "image0";
var next_image;
var next_pgid;
var curr_pgid;

var p = new Popcorn("#video");

//required here for the start.
//simply start the cursor at (0,0)
p.code({
    start: 0,
    //start time of video goes here (0 seconds)
    end: 1,
    //1 goes here. only for the first second intialize everything
    onStart: function(options) {
		svgobj.style.left = document.getElementById("slide").offsetLeft + "px";
		svgobj.style.top = "8px";
		//p.mute();
    },

	onEnd: function(options) {
		//showCursor(true);
		var next_shape;
		var shape;
		//iterate through all the shapes and pick out the main ones
		for (var i = 0, len = times_length; i < len-1; i++) {
			var time = times[i];
			shape = svgobj.contentDocument.getElementById("draw" + time).getAttribute("shape");
			next_shape = svgobj.contentDocument.getElementById("draw" + times[i+1]).getAttribute("shape");
			if(shape !== next_shape) {
				main_shapes_times[main_shapes_times.length] = time;
			}
		}
		if(times.length !== 0) {
			main_shapes_times[main_shapes_times.length] = times[times.length-1]; //put last value into this array always!
		}
	}
});

//update 60x / second the position of the next value.
p.code({
    start: 3, //give it 3 seconds to load the svg
    //start time
    end: p.duration(),
    onFrame: function(options) {
		var start = new Date().getTime();
		if(!((p.paused() === true) && (p.seeking() === false))) {
			//showCursor(true);
			//svgfile = svgobj.contentDocument.getElementById("svgfile");
			var t = p.currentTime().toFixed(1); //get the time and round to 1 decimal place

			//cursor_x_global = getNextX(""+t); //get the next cursor position
			//cursor_y_global = getNextY(""+t); //get the next cursor position

			var current_shape = svgobj.contentDocument.getElementById("draw" + t);
			//if there is actually a new shape to be displayed
			if(current_shape !== null) {
				//get the type of shape
				current_shape = current_shape.getAttribute("shape"); //get actual shape tag for this specific time of playback
			}

			//redraw everything (only way to make everything elegant)
			for (var i = 0, len = times_length; i < len; i++) {
				var time_s = times[i];
				var time_f = parseFloat(time_s);
				var shape = svgobj.contentDocument.getElementById("draw" + time_s);
				var shape_i = shape.getAttribute("shape");
				//for the shapes with times that have passed
				if (time_f < t) {
					if(shape_i === current_shape) { //currently drawing the same shape so don't draw the older steps
						shape.style.visibility = "hidden"; //hide older steps to shape
					}
					//as long as it is a main shape, it can be drawn... no intermediate steps.
					else if(main_shapes_times.indexOf(time_s) !== -1) {
						//As long as the undo event hasn't happened yet...
						if(parseFloat(shape.getAttribute("undo")) === -1) {
							shape.style.visibility = "visible";
						}
						else if (parseFloat(shape.getAttribute("undo")) > t) {
							shape.style.visibility = "visible";
						}
						else {
							shape.style.visibility = "hidden";
						}
					}
				}
				//for the shape with the time specific to the current time
				else if(time_s === t) {
					shape.style.visibility = "visible";
				}
				//for shapes that shouldn't be drawn yet (larger time than current time), don't draw them.
				else { // then time_f is > t
					shape.style.visibility = "hidden";
				}
			}

			//update the cursor
			//if((cursor_x_global != -1) && (cursor_y_global != -1)) {
			//	draw(cursor_x_global, cursor_y_global); //draw the cursor
			//}

			var next_image = getImageAtTime(t); //fetch the name of the image at this time.
			//changing slide image
			if((current_image !== next_image) && (next_image !== undefined)){
				svgobj.contentDocument.getElementById(current_image).style.visibility = "hidden";
				svgobj.contentDocument.getElementById(next_image).style.visibility = "visible";

				var num_current = current_image.substr(5);
				var num_next = next_image.substr(5);
				var currentcanvas = svgobj.contentDocument.getElementById("canvas" + num_current);
				if(currentcanvas !== null) {
					currentcanvas.setAttribute("display", "none");
				}
				var nextcanvas = svgobj.contentDocument.getElementById("canvas" + num_next);
				if((nextcanvas !== undefined) && (nextcanvas != null)) {
					nextcanvas.setAttribute("display", "");
				}
				current_image = next_image;
			}
			
			var vboxVal = getViewboxAtTime(t);
			if(vboxVal !== undefined) {
				setViewBox(vboxVal);
			}
			
			var cursorVal = getCursorAtTime(t);
			if(cursorVal != null) {
				setCursor(cursorVal);
			}
			
			var elapsed = new Date().getTime() - start;
			if(parseInt(elapsed, 10) !== 0) {
				//console.log("frame time: " + elapsed);
			}
		}
  }
}); //ends the codes -- keep it here and simply copy the frames above.
