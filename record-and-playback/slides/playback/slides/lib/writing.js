// - - - START OF GLOBAL VARIABLES - - - //

//coordinates to set
var cursor_x_global;
var cursor_y_global;
var zoomRate = 1.001;

//var canvas = document.getElementById("canv");
//var ctx = canvas.getContext("2d");

//coordinates for x and y for each second
var cursor_x = [0, 10, 20, 40, 50, 100];
var cursor_y = [0, 10, 20, 30, 60, 60];
var panAndZoomTimes = [];
var h_ratios = [];
var w_ratios = [];
var x_offsets = [];
var y_offsets = [];
var viewBoxes = [];
var times = [];

//hello

var output = {};

var svgobj = document.getElementById("svgobject");
var svgfile = null;

function getUrlParameters() {
        var map = {};
        var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) { map[key] = value; });
        return map;
}

var params = getUrlParameters();
var MEETINGID = params['meetingId'];
var HOST = window.location.hostname;
var shapes_svg = "http://" + HOST + "/slides/" + MEETINGID + '/shapes.svg';
var events_xml = "http://" + HOST + "/slides/" + MEETINGID + '/panzooms.xml';

//current time
var t;

//making the object for requesting the read of the shapes.xml file.
if (window.XMLHttpRequest){
	// code for IE7+, Firefox, Chrome, Opera, Safari
	xmlhttp=new XMLHttpRequest();
}
else {
	// code for IE6, IE5
	xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
}
//read the shapes file
xmlhttp.open("GET", shapes_svg, false);
xmlhttp.send();
xmlDoc=xmlhttp.responseXML;
//getting all the event tags
shapeelements=xmlDoc.getElementsByTagName("svg");

//get the array of values for the first shape (getDataPoints(0) is the first shape).
var array = shapeelements[0].getElementsByTagName("g"); //get all the lines from the svg file

//fill the times array with the times of the svg images.
for (var j=0;j<array.length-1;j++) {
	//console.log(array[j].getAttribute("id")); 
	times[j]=array[j].getAttribute("id").substr(4);
	//console.log(parseFloat(array[j].getAttribute("id").substr(4)));
}

var times_length = times.length; //get the length of the times array.

xmlhttp.open("GET", events_xml, false);
xmlhttp.send();
xmlDoc=xmlhttp.responseXML;
//getting all the event tags
panelements=xmlDoc.getElementsByTagName("recording");
var panZoomArray = panelements[0].getElementsByTagName("event");
viewBoxes = xmlDoc.getElementsByTagName("viewBox");
//h_ratios_unparsed = xmlDoc.getElementsByTagName("heightRatio");
//w_ratios_unparsed = xmlDoc.getElementsByTagName("widthRatio");
//x_offsets_unparsed = xmlDoc.getElementsByTagName("xOffset");
//y_offsets_unparsed = xmlDoc.getElementsByTagName("yOffset");
//fill the times array with the times of the svg images.
for (var k=0;k<panZoomArray.length;k++) {
	//console.log(array[j].getAttribute("id")); 
	panAndZoomTimes[k]=panZoomArray[k].getAttribute("timestamp");
	output[panZoomArray[k].getAttribute("timestamp")] = {viewBoxValue:viewBoxes[k].childNodes[0]}
	//h_ratios[k] = h_ratios_unparsed[k].childNodes[0];
	//w_ratios[k] = w_ratios_unparsed[k].childNodes[0];
	//y_offsets[k] = y_offsets_unparsed[k].childNodes[0];
	//x_offsets[k] = x_offsets_unparsed[k].childNodes[0];
}

// - - - END OF GLOBAL VARIABLES - - - //

// - - - START OF JAVASCRIPT FUNCTIONS - - - //

// Retrieves the next X point on the grid which the cursor is to go to.
function getNextX(t) {
    var x = times.indexOf(t);
    if(x != -1) {
		//console.log("returning " + cursor_x[x]);
        return cursor_x[x];
    }
	else return -1;
}

// Retrieves the next Y point on the grid which the cursor is to go to. 
function getNextY(t) {
    var y = times.indexOf(t);
    if(y != -1) {
		//console.log("returning " + cursor_y[y]);
        return cursor_y[y];
    }
	else return -1;
}

function pan(direction, panRate)
{
	//svgfile = svgobj.contentDocument.getElementById("svgfile");
	var viewBox = svgfile.getAttribute('viewBox');	// Grab the object representing the SVG element's viewBox attribute.
	var viewBoxValues = viewBox.split(' ');			// Create an array and insert each individual view box attribute value (assume they're seperated by a single whitespace character).

	viewBoxValues[0] = parseFloat(viewBoxValues[0]);		// Convert string "numeric" values to actual numeric values.
	viewBoxValues[1] = parseFloat(viewBoxValues[1]);

	switch (direction)
	{
	case "right":
	  viewBoxValues[0] += panRate;	// Increase the x-coordinate value of the viewBox attribute to pan right.
	  break;
	case "left":
	  viewBoxValues[0] -= panRate;	// Decrease the x-coordinate value of the viewBox attribute to pan left.
	  break;
	case "up":
	  viewBoxValues[1] += panRate;	// Increase the y-coordinate value of the viewBox attribute to pan down.
	  break;
	case "down":
	  viewBoxValues[1] -= panRate;	// Decrease the y-coordinate value of the viewBox attribute to pan up.      
	  break;                         
	} // switch

	svgfile.setAttribute('viewBox', viewBoxValues.join(' '));	// Convert the viewBoxValues array into a string with a white space character between the given values.
}

// Draw the cursor at a specific point
function draw(x, y) {
    //console.log("drawing " + x + " and " + y);
    //move to the next place
    document.getElementById("cursor").style.left = (parseInt(document.getElementById("slide").offsetLeft) + parseInt(x)) + "px";
    document.getElementById("cursor").style.top = (parseInt(document.getElementById("slide").offsetTop) + parseInt(y)) + "px";
}

// Shows or hides the cursor object depending on true/false parameter passed.
function showCursor(boolVal) {
    if(boolVal == false) {
        document.getElementById("cursor").style.height = "0px";
        document.getElementById("cursor").style.width = "0px";
    }
    else {
        document.getElementById("cursor").style.height = "10px";
        document.getElementById("cursor").style.width = "10px";
    }
}

// - - - END OF JAVASCRIPT FUNCTIONS - - - //

window.onresize = function(event){
	svgobj.style.left = document.getElementById("slide").offsetLeft + "px";
    svgobj.style.top = "8px";
}

function zoom(zoomType) {
		//svgfile = svgobj.contentDocument.getElementById("svgfile");
		var viewBox = svgfile.getAttribute('viewBox');	// Grab the object representing the SVG element's viewBox attribute.
		var viewBoxValues = viewBox.split(' ');				// Create an array and insert each individual view box attribute value (assume they're seperated by a single whitespace character).

		viewBoxValues[2] = parseFloat(viewBoxValues[2]);		// Convert string "numeric" values to actual numeric values.
		viewBoxValues[3] = parseFloat(viewBoxValues[3]);

		if (zoomType == 'zoomIn')
		{
		viewBoxValues[2] /= zoomRate;	// Decrease the width and height attributes of the viewBox attribute to zoom in.
		viewBoxValues[3] /= zoomRate;	
		}
		else if (zoomType == 'zoomOut')
		{
		viewBoxValues[2] *= zoomRate;	// Increase the width and height attributes of the viewBox attribute to zoom out.
		viewBoxValues[3] *= zoomRate;	
		}
		else
		alert("function zoom(zoomType) given invalid zoomType parameter.");

		svgfile.setAttribute('viewBox', viewBoxValues.join(' '));	// Convert the viewBoxValues array into a string with a white space character between the given values.
}

function setViewBox(val) {
	svgfile = svgobj.contentDocument.getElementById("svgfile");
	svgfile.setAttribute('viewBox', val);
	
}

var p = Popcorn("#video")

//required here for the start.
//simply start the cursor at (0,0)
.code({
    start: 0,
    //start time of video goes here (0 seconds)
    end: 1,
    //1 goes here. only for the first second intialize everything
    onStart: function(options) {
		cursor_x_global = 0;
		cursor_y_global = 0;
		svgobj.style.left = document.getElementById("slide").offsetLeft + "px";
		svgobj.style.top = "8px";
		svgobj.style.visibility = "hidden"; //clear page
    },
	
	onEnd: function(options) {
		//make the canvas visible
		svgobj.style.visibility = "visible";
		showCursor(true);
		svgfile = svgobj.contentDocument.getElementById("svgfile");
	}
})

//update 60x / second the position of the next value.
.code({
    start: 3, //give it 3 seconds to load the svg
    //start time
    end: Popcorn("#video").duration(),
    onFrame: function(options) {
		if((p.paused() == true) && (p.seeking() == false)) {
		}
		else {
			//p.mute(); //muting for testing
			//showCursor(true);
			svgfile = svgobj.contentDocument.getElementById("svgfile");
			var t = p.currentTime().toFixed(1); //get the time and round to 1 decimal place
			
			cursor_x_global = getNextX(""+t); //get the next cursor position
			cursor_y_global = getNextY(""+t); //get the next cursor position
			
			//redraw everything (only way to make everything elegant)
			for (i = 0, len = times_length; i < len; i++) {
				time = times[i];
				if (parseFloat(time) <= t) {
					svgobj.contentDocument.getElementById("draw" + time).style.visibility = "visible";
				}
				else { // then parseFloat(time) is > t
					svgobj.contentDocument.getElementById("draw" + time).style.visibility = "hidden";
				}
			}
			if((cursor_x_global != -1) && (cursor_y_global != -1)) {
				draw(cursor_x_global, cursor_y_global); //draw the cursor
			}
			vboxVal = output[""+t];
			if(vboxVal != undefined) {
				setViewBox(vboxVal.viewBoxValue.data);
			}
		}
    }
})
    
; //ends the codes -- keep it here and simply copy the frames above.
