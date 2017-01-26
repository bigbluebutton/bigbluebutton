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
    console.log("** Getting url params");
    var map = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) { map[key] = value; });
    return map;
}

// - - - END OF GLOBAL VARIABLES - - - //

// - - - START OF JAVASCRIPT FUNCTIONS - - - //

// Draw the cursor at a specific point
function drawCursor(scaledX, scaledY, img) {
  var containerObj = $("#slide > object");

  // the offsets of the image inside its parent
  // Note: this block is only necessary if we let the svg do the resizing
  // of the image, see the comments in resizeSlides()
  var imgRect = img.getBoundingClientRect();
  var imageX = 0; //imgRect.x;
  var imageY = 0; //imgRect.y;

  // Important to place the cursor over the deskshare
  // It should not affect the regular slides
  var scaledWidthTranslate = widthTranslate * (containerObj.width() / deskshareWidth);
  var scaledHeightTranslate = heightTranslate * (containerObj.height() / deskshareHeight);

  // the offsets of the container that has the image inside it
  var containerX = containerObj.offset().left + scaledWidthTranslate;
  var containerY = containerObj.offset().top + scaledHeightTranslate;

  // calculates the overall offsets of the image in the page
  var imageOffsetX = containerX + imageX;
  var imageOffsetY = containerY + imageY;

  // position of the cursor relative to the container
  var cursorXInImage = scaledX * (containerObj.width() * widthScale);
  var cursorYInImage = scaledY * (containerObj.height() * heightScale);

  // absolute position of the cursor in the page
  var cursorLeft = parseInt(imageOffsetX + cursorXInImage, 10);
  var cursorTop = parseInt(imageOffsetY + cursorYInImage, 10);
  if (cursorLeft < 0) {
    cursorLeft = 0;
  }
  if (cursorTop < 0) {
    cursorTop = 0;
  }
  var cursorStyle = document.getElementById("cursor").style;
  cursorStyle.left = cursorLeft + "px";
  cursorStyle.top = cursorTop + "px";
}

function showCursor(show) {
  if (show) {
    document.getElementById("cursor").style.visibility = 'visible';
  } else {
    document.getElementById("cursor").style.visibility = 'hidden';
  }
};

function setViewBox(time) {
  var vboxVal = getViewboxAtTime(time);
  if(vboxVal !== undefined) {
    setTransform(time);
    if(svgobj.contentDocument) svgfile = svgobj.contentDocument.getElementById("svgfile");
    else svgfile = svgobj.getSVGDocument('svgfile').getElementById("svgfile");
    svgfile.setAttribute('viewBox', vboxVal);
  }
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
	var isDeskshare = mustShowDesktopVideo(time);
	for (key in vboxValues) {
		if(vboxValues.hasOwnProperty(key)) {
			var arry = key.split(",");
			if(arry[1] == "end") {
				return isDeskshare ? adaptViewBoxToDeskshare(vboxValues[key]) : vboxValues[key];
			}
			else if ((parseFloat(arry[0]) <= curr_t) && (parseFloat(arry[1]) >= curr_t)) {
				return isDeskshare ? adaptViewBoxToDeskshare(vboxValues[key]) : vboxValues[key];
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

function mustShowDesktopVideo(time) {
  var canShow = false;
  for (var m = 0; m < deskshareTimes.length; m++) {
    var start_timestamp = deskshareTimes[m][0];
    var stop_timestamp = deskshareTimes[m][1];

    if(time >= start_timestamp && time <= stop_timestamp)
      canShow = true;
  }

  return canShow;
}

function isThereDeskshareVideo() {
  return deskshareTimes.length > 0;
}

function resyncVideos() {
  var currentTime = Popcorn('#video').currentTime();
  var currentDeskshareVideoTime = Popcorn("#deskshare-video").currentTime();
  if (Math.abs(currentTime - currentDeskshareVideoTime) >= 0.1)
    Popcorn("#deskshare-video").currentTime(currentTime);
}

function handlePresentationAreaContent(time) {
  var mustShow = mustShowDesktopVideo(time);
  if(!sharingDesktop && mustShow) {
    console.log("Showing deskshare video...");
    document.getElementById("deskshare-video").style.visibility = "visible";
    $('#slide').addClass('no-background');
    sharingDesktop = true;
  } else if(sharingDesktop && !mustShow) {
    console.log("Hiding deskshare video...");
    document.getElementById("deskshare-video").style.visibility = "hidden";
    $('#slide').removeClass('no-background');
    sharingDesktop = false;
  }

  if(isThereDeskshareVideo()) {
    resyncVideos();
    resizeDeshareVideo();
  }
}

// - - - END OF JAVASCRIPT FUNCTIONS - - - //


function startLoadingBar() {
  console.log("==Hide playback content");
  $("#playback-content").css('visibility', 'hidden');
  Pace.once('done', function() {
    $("#loading-error").css('height','0');
    console.log("==Show playback content");
    $("#playback-content").css('visibility', 'visible');
  });
  Pace.start();
}

function runPopcorn() {
  console.log("** Running popcorn");

  getMetadata();

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
  console.log("** Getting shapes_svg");
  xmlhttp.open("GET", shapes_svg, false);
  xmlhttp.send();
  var xmlDoc = xmlhttp.responseXML;

  console.log("** Processing shapes_svg");
  //getting all the event tags
  var shapeelements = xmlDoc.getElementsByTagName("svg");

  //get the array of values for the first shape (getDataPoints(0) is the first shape).
  var array = $(shapeelements[0]).find("g").filter(function(){ //get all the lines from the svg file
    return $(this).attr('class') == 'shape';
  });

  //create a map from timestamp to id list
  var timestampToId = {};
  for (var j = 0; j < array.length; j++) {
    shapeTime = array[j].getAttribute("timestamp");
    shapeId = array[j].getAttribute("id");

    if (timestampToId[shapeTime] == undefined) {
      timestampToId[shapeTime] = new Array(0);
    }
    timestampToId[shapeTime].push(shapeId);
  }

  //fill the times array with the times of the svg images.
  for (var j = 0; j < array.length; j++) {
    times[j] = array[j].getAttribute("timestamp");
  }

  var times_length = times.length; //get the length of the times array.

  getPresentationText();

  // PROCESS PANZOOMS.XML
  console.log("** Getting panzooms.xml");
  xmlhttp.open("GET", events_xml, false);
  xmlhttp.send();
  xmlDoc = xmlhttp.responseXML;
  //getting all the event tags
  console.log("** Processing panzooms.xml");
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
  console.log("** Getting cursor.xml");
  xmlhttp.open("GET", cursor_xml, false);
  xmlhttp.send();
  xmlDoc = xmlhttp.responseXML;
  //getting all the event tags
  console.log("** Processing cursor.xml");
  var curelements = xmlDoc.getElementsByTagName("recording");
  var cursorArray = curelements[0].getElementsByTagName("event");
  coords = xmlDoc.getElementsByTagName("cursor");

  var clen = cursorArray.length;
  //fill the times array with the times of the svg images.
  if(cursorArray.length != 0) cursorValues["0"] = "0 0";
  for (var m = 0; m < clen; m++) {
  	cursorValues[cursorArray[m].getAttribute("timestamp")] = coords[m].childNodes[0].data;
  }


  // PROCESS DESKSHARE.XML
  console.log("** Getting deskshare.xml");
  xmlhttp.open("GET", deskshare_xml, false);
  xmlhttp.send();
  xmlDoc = xmlhttp.responseXML;
  //getting all the event tags
  console.log("** Processing deskshare.xml");
  var deskelements = xmlDoc.getElementsByTagName("recording");
  var deskshareArray = deskelements[0].getElementsByTagName("event");

  if(deskshareArray != null && deskshareArray.length != 0) {
    for (var m = 0; m < deskshareArray.length; m++) {
      var deskTimes = [parseFloat(deskshareArray[m].getAttribute("start_timestamp")),parseFloat(deskshareArray[m].getAttribute("stop_timestamp"))];
      deskshareTimes[m] = deskTimes;
    }
  }

  svgobj.style.left = document.getElementById("slide").offsetLeft + "px";
  svgobj.style.top = "0px";
  var next_shape;
  var shape;
  for (var j = 0; j < array.length - 1; j++) { //iterate through all the shapes and pick out the main ones
    var time = array[j].getAttribute("timestamp");
    shape = array[j].getAttribute("shape");
    next_shape = array[j+1].getAttribute("shape");

  	if(shape !== next_shape) {
  		main_shapes_ids.push(array[j].getAttribute("id"));
  	}
  }
  if (array.length !== 0) {
    main_shapes_ids.push(array[array.length-1].getAttribute("id")); //put last value into this array always!
  }

  var get_shapes_in_time = function(t) {
    // console.log("** Getting shapes in time");
    var shapes_in_time = timestampToId[t];
    var shapes = [];
    if (shapes_in_time != undefined) {
      var shape = null;
      for (var i = 0; i < shapes_in_time.length; i++) {
        var id = shapes_in_time[i];
        if(svgobj.contentDocument) shape = svgobj.contentDocument.getElementById(id);
        else shape = svgobj.getSVGDocument('svgfile').getElementById(id);

        if (shape !== null) { //if there is actually a new shape to be displayed
          shape = shape.getAttribute("shape"); //get actual shape tag for this specific time of playback
          shapes.push(shape);
        }
      }
    }
    return shapes;
  };

  var p = new Popcorn("#video");
  //update 60x / second the position of the next value.
  p.code({
      start: 1, // start time
      end: p.duration(),
      onFrame: function(options) {
        //console.log("**Popcorn video onframe");
        if(!((p.paused() === true) && (p.seeking() === false))) {
          var t = p.currentTime().toFixed(1); //get the time and round to 1 decimal place

          current_shapes = get_shapes_in_time(t);

          //redraw everything (only way to make everything elegant)
          for (var i = 0; i < array.length; i++) {
            var time_s = array[i].getAttribute("timestamp");
            var time_f = parseFloat(time_s);

            if(svgobj.contentDocument) shape = svgobj.contentDocument.getElementById(array[i].getAttribute("id"));
            else shape = svgobj.getSVGDocument('svgfile').getElementById(array[i].getAttribute("id"));

            var shape_i = shape.getAttribute("shape");
            if (time_f < t) {
              if(current_shapes.indexOf(shape_i) > -1) { //currently drawing the same shape so don't draw the older steps
                shape.style.visibility = "hidden"; //hide older steps to shape
              } else if(main_shapes_ids.indexOf(shape.getAttribute("id")) > -1) { //as long as it is a main shape, it can be drawn... no intermediate steps.
                if(parseFloat(shape.getAttribute("undo")) === -1) { //As long as the undo event hasn't happened yet...
                  shape.style.visibility = "visible";
                } else if (parseFloat(shape.getAttribute("undo")) > t) {
                  shape.style.visibility = "visible";
                } else {
                  shape.style.visibility = "hidden";
                }
              }
            } else if(time_s === t) { //for the shapes with the time specific to the current time
              // only makes visible the last drawing of a given shape
              var idx = current_shapes.indexOf(shape_i);
              if (idx > -1) {
                current_shapes.splice(idx, 1);
                idx = current_shapes.indexOf(shape_i);
                if (idx > -1) {
                  shape.style.visibility = "hidden";
                } else {
                  shape.style.visibility = "visible";
                }
              } else {
                // this is an inconsistent state, since current_shapes should have at least one drawing of this shape
                shape.style.visibility = "hidden";
              }
            } else { //for shapes that shouldn't be drawn yet (larger time than current time), don't draw them.
              shape.style.visibility = "hidden";
            }
          }

          var next_image = getImageAtTime(t); //fetch the name of the image at this time.
          var imageXOffset = 0;
          var imageYOffset = 0;

          if(current_image && (current_image !== next_image) && (next_image !== undefined)){	//changing slide image
            if(svgobj.contentDocument) {
              var img = svgobj.contentDocument.getElementById(current_image);
              if (img) {
                img.style.visibility = "hidden";
              }
              var ni = svgobj.contentDocument.getElementById(next_image);
            }
            else {
              var img = svgobj.getSVGDocument('svgfile').getElementById(current_image);
              if (img) {
                img.style.visibility = "hidden";
              }
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
            previous_image = current_image;
            current_image = next_image;
          }

          if(svgobj.contentDocument) var thisimg = svgobj.contentDocument.getElementById(current_image);
          else var thisimg = svgobj.getSVGDocument('svgfile').getElementById(current_image);

          if (thisimg) {
            var imageWidth = parseInt(thisimg.getAttribute("width"), 10);
            var imageHeight = parseInt(thisimg.getAttribute("height"), 10);

            setViewBox(t);

            var cursorVal = getCursorAtTime(t);
            if (cursorVal != null) {
              cursorShownAt = new Date().getTime();
              showCursor(true);
              // width and height are divided by 2 because that's the value used as a reference
              // when positions in cursor.xml is calculated
              drawCursor(parseFloat(cursorVal[0]) / (imageWidth/2), parseFloat(cursorVal[1]) / (imageHeight/2), thisimg);

              // hide the cursor after 3s of inactivity
            } else if (cursorShownAt < new Date().getTime() - 3000) {
              showCursor(false);
            }

            // store the current slide and adjust the size of the slides
            currentImage = thisimg;
            resizeSlides();
          }

          handlePresentationAreaContent(t);
       }
    }
  });
};

// Deskshare's whiteboard variables
var deskshareWidth = 1280.0;
var deskshareHeight = 720.0;
var widthScale = 1;
var heightScale = 1;
var widthTranslate = 0;
var heightTranslate = 0;

function clearTransform() {
  widthScale = 1;
  heightScale = 1;
  widthTranslate = 0;
  heightTranslate = 0;
}

function setDeskshareScale(viewBox) {
  widthScale = viewBox[2] / deskshareWidth;
  heightScale = viewBox[3] / deskshareHeight;
}

function setDeskshareTranslate(viewBox) {
  widthTranslate = (deskshareWidth - viewBox[2]) / 2;
  heightTranslate = (deskshareHeight - viewBox[3]) / 2;
}

// Deskshare viewBox has the information to transform the canvas to place it above the video
function adaptViewBoxToDeskshare(viewBox) {
  var vb = viewBox.split(" ");
  setDeskshareScale(vb);
  setDeskshareTranslate(vb);
  vb[0] = 0;
  vb[1] = 0;
  vb[2] = deskshareWidth;
  vb[3] = deskshareHeight;
  return vb.join(" ");
}

// Transform canvas to fit the different deskshare video sizes
function setTransform(time) {
  if (mustShowDesktopVideo(time)) {
    var canvasId = "canvas" + current_image.substr(5);
    var canvas = svgobj.contentDocument ? svgobj.contentDocument.getElementById(canvasId) : svgobj.getSVGDocument('svgfile').getElementById(canvasId);
    if (canvas !== undefined) {
      var scale = "scale(" + widthScale.toString() + ", " + heightScale.toString() + ")";
      var translate = "translate(" + widthTranslate.toString() + ", " + heightTranslate.toString() + ")";
      var transform = translate + " " + scale;
      canvas.setAttribute('transform', transform);
    }
  } else {
    clearTransform();
  }
}

function defineStartTime() {
  console.log("** Defining start time");

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
var previous_image = null;
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
var current_shapes = [];
//coordinates for x and y for each second
var panAndZoomTimes = [];
var viewBoxes = [];
var coords = [];
var times = [];
// timestamp and id for drawings
var shapeTime;
var shapeId;
var clearTimes = [];
var main_shapes_ids = [];
var vboxValues = {};
var cursorValues = {};
var imageAtTime = {};
var slidePlainText = {}; //holds slide plain text for retrieval
var cursorStyle;
var cursorShownAt = 0;
var deskshareTimes = [];
var sharingDesktop = false;

var params = getUrlParameters();
var MEETINGID = params.meetingId;
// var HOST = window.location.host;
// var url = "http://" + HOST + "/presentation/" + MEETINGID;
var url = "resources";
var shapes_svg = url + '/shapes.svg';
var events_xml = url + '/panzooms.xml';
var cursor_xml = url + '/cursor.xml';
var metadata_xml = url + '/metadata.xml';
var deskshare_xml = url + '/deskshare.xml';
var presentation_text_json = url + '/presentation_text.json';

var firstLoad = true;
var svjobjLoaded = false;
var videoLoaded = false;
var deskshareLoaded = false;

var svgobj = document.createElement('object');
svgobj.setAttribute('data', shapes_svg);
svgobj.setAttribute('height', '100%');
svgobj.setAttribute('width', '100%');

document.addEventListener('media-ready', function(event) {
  switch(event.detail) {
    case 'video':
    case 'audio':
      videoLoaded = true;
      break;
    case 'deskshare':
    case 'no-deskshare':
      deskshareLoaded = true;
      break;
    case 'svg':
      svjobjLoaded = true;
      break;
    default:
      console.log('unhandled media-ready event: ' + event.detail);
  }

  if (videoLoaded && deskshareLoaded && svjobjLoaded) {
    runPopcorn();

    generateThumbnails();

    var p = Popcorn("#video");
    p.currentTime(defineStartTime());
  }
}, false);

svgobj.addEventListener('load', function() {
  console.log("got svgobj 'load' event");
  document.dispatchEvent(new CustomEvent('media-ready', {'detail': 'svg'}));
}, false);

svgobj.addEventListener('error', function() {
  console.log("got svgobj 'error' event");
  onSVGLoadingError();
}, false);

function onSVGLoadingError() {
  Pace.off('done');
  Pace.stop();
  $("#loading-error").css('visibility', 'visible');
}

// Fetches the metadata associated with the recording and uses it to configure
// the playback page
var getMetadata = function() {
  var xmlhttp;
  if (window.XMLHttpRequest) {// code for IE7, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
  } else {// code for IE6, IE5
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  xmlhttp.open("GET", metadata_xml, false);
  xmlhttp.send(null);

  if (xmlhttp.responseXML)
    var xmlDoc = xmlhttp.responseXML;
  else {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(xmlhttp.responseText, "application/xml");
  }

  var metadata = xmlDoc.getElementsByTagName("meta");
  if (metadata.length > 0) {
    metadata = metadata[0];

    var meetingName = metadata.getElementsByTagName("meetingName");
    if (meetingName.length > 0) {
      $("#recording-title").text(meetingName[0].textContent);
      $("#recording-title").attr("title", meetingName[0].textContent);
    }
  }
};

function setPresentationTextFromJSON(images, presentationText) {
  for (var m = 0; m < images.length; m++) {
    len = images[m].getAttribute("in").split(" ").length;
    for (var n = 0; n < len; n++) {
      imageAtTime[[images[m].getAttribute("in").split(" ")[n], images[m].getAttribute("out").split(" ")[n]]] = images[m].getAttribute("id");
    }
    // The logo at the start has no text attribute
    if (images[m].getAttribute("text")) {
      var imgId = images[m].getAttribute("id"); // Have to save the value because images array might go out of scope
      var imgTxt = images[m].getAttribute("text").split("/"); // Text format: presentation/PRESENTATION_ID/textfiles/SLIDE_ID.txt
      var presentationId = imgTxt[1];
      var slideId = imgTxt[3].split(".")[0];
      slidePlainText[imgId] = $('<div/>').text(presentationText[presentationId][slideId]).html();
    }
  }
}

function setPresentationTextFromTxt(images) {
  for (var m = 0; m < images.length; m++) {
    len = images[m].getAttribute("in").split(" ").length;
    for (var n = 0; n < len; n++) {
      imageAtTime[[images[m].getAttribute("in").split(" ")[n], images[m].getAttribute("out").split(" ")[n]]] = images[m].getAttribute("id");
    }
    // The logo at the start has no text attribute
    if (images[m].getAttribute("text")) {
      var txtFile = false;
      if (window.XMLHttpRequest) {
        // Code for IE7+, Firefox, Chrome, Opera, Safari
        txtFile = new XMLHttpRequest();
      } else {
        // Code for IE6, IE5
        txtFile = new ActiveXObject("Microsoft.XMLHTTP");
      }
      var imgId = images[m].getAttribute("id"); // Have to save the value because images array might go out of scope
      txtFile.open("GET", url + "/" + images[m].getAttribute("text"), false);
      txtFile.onreadystatechange = function() {
          if (txtFile.readyState === 4) {
            if (txtFile.status === 200) {
              slidePlainText[imgId] = $('<div/>').text(txtFile.responseText).html();
            }
          }
      };
      txtFile.send(null);
    }
  }
}

function processPresentationText(response) {
  // Making the object for requesting the read of the XML files.
  if (window.XMLHttpRequest) {
    // Code for IE7+, Firefox, Chrome, Opera, Safari
    var xmlhttp = new XMLHttpRequest();
  } else {
    // Code for IE6, IE5
    var xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  xmlhttp.open("GET", shapes_svg, false);
  xmlhttp.send();
  var xmlDoc = xmlhttp.responseXML;

  // Getting all the event tags
  var shapeelements = xmlDoc.getElementsByTagName("svg");

  // Newer recordings have slide images identified by class="slide"
  // because they might include images in shapes
  var images = shapeelements[0].getElementsByClassName("slide");
  // To handle old recordings, fetch a list of all images instead
  if (images.length == 0) {
    images = shapeelements[0].getElementsByTagName("image");
  }

  if (response !== undefined) {
    setPresentationTextFromJSON(images, response);
  } else {
    setPresentationTextFromTxt(images);
  }
}

function getPresentationText() {
  console.log("** Getting text files");
  loadJSON(processPresentationText, presentation_text_json);
}

function loadJSON(callback, url) {
  var xobj;
  if (window.XMLHttpRequest) {
    // Code for IE7+, Firefox, Chrome, Opera, Safari
    xobj = new XMLHttpRequest();
  } else {
    // Code for IE6, IE5
    xobj = new ActiveXObject("Microsoft.XMLHTTP");
  }
  xobj.overrideMimeType("application/json");
  xobj.open('GET', url, true);
  xobj.onreadystatechange = function () {
      if (xobj.readyState == 4) {
        // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
        if (xobj.status == "200") {
          callback(JSON.parse(xobj.responseText));
        } else {
          console.log("Could not get JSON file");
          callback(undefined);
        }
      }
  };
  xobj.send(null);
}

document.getElementById('slide').appendChild(svgobj);

var currentImage;

// A small hack to hide the cursor when resizing the window, so it's not
// misplaced while the window is being resized
window.onresize = function(event) {
	showCursor(false);
  resizeSlides();
  resizeDeshareVideo();
};

// Resize the container that has the slides (and whiteboard) to be the maximum
// size possible but still maintaining the aspect ratio of the slides.
//
// This is done here only because of pan and zoom. Pan/zoom is done by modifiyng
// the svg's viewBox, and that requires the container that has the svg to be the
// exact size we want to display the slides so that parts of the svg that are outside
// of its parent's area are hidden. If we let the svg occupy all presentation area
// (letting the svg do the image resizing), the slides will move and zoom around the
// entire area when pan/zoom is activated, usually displaying more of the slide
// than we want to (i.e. more than was displayed in the conference).
var resizeSlides = function() {
  if (currentImage) {
    var $slide = $("#slide");

    var imageWidth = parseInt(currentImage.getAttribute("width"), 10);
    var imageHeight = parseInt(currentImage.getAttribute("height"), 10);
    var imgRect = currentImage.getBoundingClientRect();
    var aspectRatio = imageWidth/imageHeight;
    var max = aspectRatio * $slide.parent().outerHeight();
    $slide.css("max-width", max);

    var height = $slide.parent().width() / aspectRatio;
    $slide.css("max-height", height);
  }
};

var resizeDeshareVideo = function() {
  if (isThereDeskshareVideo()) {
    var $deskhareVideo = $("#deskshare-video");

    var videoWidth = parseInt(document.getElementById("deskshare-video").videoWidth, 10);
    var videoHeight = parseInt(document.getElementById("deskshare-video").videoHeight, 10);

    var aspectRatio = videoWidth/videoHeight;
    var max = aspectRatio * $deskhareVideo.parent().outerHeight();
    $deskhareVideo.css("max-width", max);

    var height = $deskhareVideo.parent().width() / aspectRatio;
    $deskhareVideo.css("max-height", height);
  }
};
