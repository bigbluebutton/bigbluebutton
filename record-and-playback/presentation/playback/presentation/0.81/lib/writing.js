/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/


// - - - START OF GLOBAL VARIABLES - - - //
"use strict";

function getUrlParameters() {
    var map = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) { map[key] = value; });
    return map;
}

// - - - END OF GLOBAL VARIABLES - - - //

// - - - START OF JAVASCRIPT FUNCTIONS - - - //

// Draw the cursor at a specific point
function draw(x, y) {
    cursorStyle = document.getElementById("cursor").style;
    var slide = document.getElementById("slide");
    var obj = $("#slide > object");
    var scaledX = parseInt(x, 10) * (parseInt(obj.attr("width"), 10) / 800);
    var scaledY = parseInt(y, 10) * (parseInt(obj.attr("height"), 10) / 600); 
    
    //move to the next place
    var leftValue = parseInt(slide.offsetLeft, 10) + parseInt(scaledX, 10)
    var topValue = parseInt(slide.offsetTop, 10) + parseInt(scaledY, 10)
    if (leftValue < 0){
        leftValue = 0
    }
    if (topValue < 0){
        topValue = 0
    }
    cursorStyle.left = leftValue + "px";
    cursorStyle.top = topValue + "px";

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
  if(svgobj.contentDocument) svgfile = svgobj.contentDocument.getElementById("svgfile");
  else svgfile = svgobj.getSVGDocument('svgfile').getElementById("svgfile");
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
	var coords = cursorValues[time];
	if(coords) return coords.split(' ');
}

function removeSlideChangeAttribute() {
	$('#video').removeAttr('slide-change');
	Popcorn('#video').unlisten(Popcorn.play, 'removeSlideChangeAttribute');
}

// - - - END OF JAVASCRIPT FUNCTIONS - - - //

function runPopcorn() {
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
  var array = $(shapeelements[0]).find("g").filter(function(){ //get all the lines from the svg file   
    return $(this).attr('class') == 'shape';
  });
  var images = shapeelements[0].getElementsByTagName("image");

  //fill the times array with the times of the svg images.
  for (var j = 0; j < array.length; j++) {
  	times[j] = array[j].getAttribute("id").substr(4);
  }

  var times_length = times.length; //get the length of the times array.

  for(var m = 0; m < images.length; m++) {
  	len = images[m].getAttribute("in").split(" ").length;
  	for(var n = 0; n < len; n++) {
  		imageAtTime[[images[m].getAttribute("in").split(" ")[n], images[m].getAttribute("out").split(" ")[n]]] = images[m].getAttribute("id");
  	}
        
        // the logo at the start has no text attribute
        if (images[m].getAttribute("text")) {
          var txtFile = false;
          if (window.XMLHttpRequest) {
  	    // code for IE7+, Firefox, Chrome, Opera, Safari
  	    txtFile = new XMLHttpRequest();
          } else {
  	    // code for IE6, IE5
  	    txtFile = new ActiveXObject("Microsoft.XMLHTTP");
          }
          var imgid = images[m].getAttribute("id"); //have to save the value because images array might go out of scope
          txtFile.open("GET", url + "/" + images[m].getAttribute("text"), false);
          txtFile.onreadystatechange = function() {
              if (txtFile.readyState === 4) {
                if (txtFile.status === 200) {
                  slidePlainText[imgid] = $('<div/>').text(txtFile.responseText).html();
                  console.log("Text file read " + imgid);
                }
              }
          };
          txtFile.send(null);
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
  if(cursorArray.length != 0) cursorValues["0"] = "0 0";
  for (var m = 0; m < clen; m++) {
  	cursorValues[cursorArray[m].getAttribute("timestamp")] = coords[m].childNodes[0].data;
  }
  
  svgobj.style.left = document.getElementById("slide").offsetLeft + "px";
  svgobj.style.top = "8px";
  var next_shape;
  var shape;
  for (var i = 0, len = times_length; i < len-1; i++) { //iterate through all the shapes and pick out the main ones
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
  
  var p = new Popcorn("#video");
  //update 60x / second the position of the next value.
  p.code({
      start: 1, // start time
      end: p.duration(),
      onFrame: function(options) {
        if(!((p.paused() === true) && (p.seeking() === false))) {
          var t = p.currentTime().toFixed(1); //get the time and round to 1 decimal place
          
          if(svgobj.contentDocument) current_shape = svgobj.contentDocument.getElementById("draw" + t);
          else current_shape = svgobj.getSVGDocument('svgfile').getElementById("draw" + t);

          if(current_shape !== null) { //if there is actually a new shape to be displayed
            current_shape = current_shape.getAttribute("shape"); //get actual shape tag for this specific time of playback
          }
          //redraw everything (only way to make everything elegant)
          for (var i = 0, len = times_length; i < len; i++) {
            var time_s = times[i];
            var time_f = parseFloat(time_s);
            
            if(svgobj.contentDocument) shape = svgobj.contentDocument.getElementById("draw" + time_s);
            else shape = svgobj.getSVGDocument('svgfile').getElementById("draw" + time_s);
            
            var shape_i = shape.getAttribute("shape");
            if (time_f < t) {
              if(shape_i === current_shape) { //currently drawing the same shape so don't draw the older steps
                shape.style.visibility = "hidden"; //hide older steps to shape
  	      }
              else if(main_shapes_times.indexOf(time_s) !== -1) { //as long as it is a main shape, it can be drawn... no intermediate steps.
                if(parseFloat(shape.getAttribute("undo")) === -1) { //As long as the undo event hasn't happened yet...
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
            else if(time_s === t) { //for the shape with the time specific to the current time
              shape.style.visibility = "visible";
            }
            else { //for shapes that shouldn't be drawn yet (larger time than current time), don't draw them.
              shape.style.visibility = "hidden";
            }
          }
          
          var next_image = getImageAtTime(t); //fetch the name of the image at this time.
          var imageXOffset = 0;
          var imageYOffset = 0;
          if((current_image !== next_image) && (next_image !== undefined)){	//changing slide image
            if(svgobj.contentDocument) {
              svgobj.contentDocument.getElementById(current_image).style.visibility = "hidden";
              var ni = svgobj.contentDocument.getElementById(next_image);
            }
            else {
              svgobj.getSVGDocument('svgfile').getElementById(current_image).style.visibility = "hidden";
              var ni = svgobj.getSVGDocument('svgfile').getElementById(next_image);
            }
            document.getElementById("slideText").innerHTML = ""; //destroy old plain text
            
            ni.style.visibility = "visible";
            document.getElementById("slideText").innerHTML = slidePlainText[next_image] + next_image; //set new plain text
            
            if ($("#accEnabled").is(':checked')) {
              //pause the playback on slide change
              p.pause();
              $('#video').attr('slide-change', 'slide-change');
              p.listen(Popcorn.play, removeSlideChangeAttribute);
            }

            var num_current = current_image.substr(5);
            var num_next = next_image.substr(5);
            
            if(svgobj.contentDocument) currentcanvas = svgobj.contentDocument.getElementById("canvas" + num_current);
            else currentcanvas = svgobj.getSVGDocument('svgfile').getElementById("canvas" + num_current);
            
            if(currentcanvas !== null) {
              currentcanvas.setAttribute("display", "none");
            }
            
            if(svgobj.contentDocument) nextcanvas = svgobj.contentDocument.getElementById("canvas" + num_next);
            else nextcanvas = svgobj.getSVGDocument('svgfile').getElementById("canvas" + num_next);
            
            if((nextcanvas !== undefined) && (nextcanvas != null)) {
              nextcanvas.setAttribute("display", "");
            }
            current_image = next_image;
          }
          
          if(svgobj.contentDocument) var thisimg = svgobj.contentDocument.getElementById(current_image);
          else var thisimg = svgobj.getSVGDocument('svgfile').getElementById(current_image);
  
          var offsets = thisimg.getBoundingClientRect();
          // Offsets divided by 4. By 2 because of the padding and by 2 again because 800x600 is half  1600x1200
          imageXOffset = (1600 - parseInt(thisimg.getAttribute("width"), 10))/4;
          imageYOffset = (1200 - parseInt(thisimg.getAttribute("height"), 10))/4;

          
          var vboxVal = getViewboxAtTime(t);
          if(vboxVal !== undefined) {
            setViewBox(vboxVal);
          }
          
          var cursorVal = getCursorAtTime(t);
          var cursor_on = false;
          if(cursorVal != null) {
            if(!cursor_on) {
              document.getElementById("cursor").style.visibility = 'visible'; //make visible
              cursor_on = true;
            }
            setCursor([parseFloat(cursorVal[0]) + imageXOffset - 6, parseFloat(cursorVal[1]) + imageYOffset - 6]); //-6 is for radius of cursor offset
          }
       }
    }
  });
};

function defineStartTime() {
  if (params.t === undefined)
    return 1;

  var extractNumber = /\d+/g;
  var extractUnit = /\D+/g;
  var temp_start_time = 0;

  while (true) {
    var param1 = extractUnit.exec(params.t);
    var param2 = extractNumber.exec(params.t);
    if (param1 == null || param2 == null)
      break;

    var unit = String(param1).toLowerCase();
    var value = parseInt(String(param2));

    if (unit == "h")
      value *= 3600;
    else if (unit == "m")
      value *= 60;

    temp_start_time += value;
  }

  console.log("Start time: " + temp_start_time);
  return temp_start_time;
}

var current_canvas = "canvas0";
var current_image = "image0";
var currentcanvas;
var shape;
var nextcanvas;
var next_image;
var next_pgid;
var curr_pgid;
var svgfile;
//current time
var t;
var len;
var current_shape;
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
var slidePlainText = {}; //holds slide plain text for retrieval
var cursorStyle;

var params = getUrlParameters();
var MEETINGID = params.meetingId;
var url = "/presentation/" + MEETINGID;
var shapes_svg = url + '/shapes.svg';
var events_xml = url + '/panzooms.xml';
var cursor_xml = url + '/cursor.xml';

var svgobj = document.createElement('object');
svgobj.setAttribute('data', shapes_svg);
svgobj.setAttribute('height', '600px');
svgobj.setAttribute('width', '800px');
svgobj.addEventListener('load', runPopcorn, false);

/**
 * we need an urgently refactor here
 * first the writing.js must be loaded, and then runPopcorn loads, but it loads 
 * only after the svg file gets loaded, and the generation of thumbnails must
 * came after that because it needs the popcorn element to be created properly
 */
svgobj.addEventListener('load', function() {
  generateThumbnails();
  var p = Popcorn("#video");
  p.on('loadeddata', function() {
    p.currentTime(defineStartTime());
  });

  // Sometimes media has already loaded before our loadeddata listener is 
  // attached. If the media is already past the loadeddata stage then we 
  // trigger the event manually ourselves
  if ($('#video')[0].readyState > 0) {
    p.emit('loadeddata');
  }
}, false);


document.getElementById('slide').appendChild(svgobj);

window.onresize = function(event) {
	svgobj.style.left = document.getElementById("slide").offsetLeft + "px";
  svgobj.style.top = "8px";
};
