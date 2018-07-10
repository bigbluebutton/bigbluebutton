/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2018 BigBlueButton Inc. and by respective authors (see below).
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

const logger = window.Logger || console;
const params = getURLParameters();
const meetingId = params.meetingId;
const url = getFullURL();
const metadataXML = url + '/metadata.xml';
const shapesSVG = url + '/shapes.svg';
const panzoomsXML = url + '/panzooms.xml';
const cursorXML = url + '/cursor.xml';
const deskshareXML = url + '/deskshare.xml';
const textJSON = url + '/presentation_text.json';
const captionsJSON =  url + '/captions.json';
const chatXML = url + '/slides_new.xml';
const mediasURL = [
  '/video/webcams.webm',
  '/video/webcams.mp4',
  '/deskshare/deskshare.webm',
  '/deskshare/deskshare.mp4'
];
const deskshareWidth = 1280.0;
const deskshareHeight = 720.0;
const mobileTimeout = 10 * 1000; // 10 seconds
var lastFrameTime = 0.0;
var firstLoad = true;
var meetingDuration;
var mediasToCheck = mediasURL.length;

// Metadata
var metadataXMLContent = null;

// Media events
var videoReady = false;
var audioReady = false;
var deskshareReady = false;
var captionsReady = false;

// Data events
var svgReady = false;
var textReady = false;
var panzoomReady = false;
var cursorReady = false;
var deskshareXMLReady = false;

// Shapes
var mainShapesId = [];
var currentImage = null;
var currentImageId = "image0";
var shapesArray = {};
var timestampToId = {};
var shapesSVGContent = null;
var slideAspectValues = {};
var currentSlideAspect = 0;
var imageAtTime = {};
var slidePlainText = {};

// Cursor
var cursorShownAt = 0;
var cursorValues = {};

// Panzoom
var vboxValues = {};
var viewBoxes = {};

// Deskshare
var deskshareEvents = [];
var deskshareImage = null;
var widthScale = 1;
var heightScale = 1;
var widthTranslate = 0;
var heightTranslate = 0;
var isDeskshareActive = false;
var canvasTransformed = false;

function getURLParameters() {
  logger.info("==Getting URL params");
  let map = {};
  window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {map[key] = value;});
  return map;
};

function getFullURL() {
  let url = '/presentation/' + meetingId;
  return url;
};

// http://stackoverflow.com/a/11381730
function mobileAndTabletCheck() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
}

// Draw the cursor at a specific point
function drawCursor(scaledX, scaledY) {
  let containerObj = $("#slide > div");

  // The offsets of the container that has the image inside it
  let imageOffsetX = containerObj.offset().left;
  let imageOffsetY = containerObj.offset().top;

  // Position of the cursor relative to the container
  let cursorXInImage = scaledX * containerObj.width();
  let cursorYInImage = scaledY * containerObj.height();

  // Absolute position of the cursor in the page
  let cursorLeft = parseInt(imageOffsetX + cursorXInImage, 10);
  let cursorTop = parseInt(imageOffsetY + cursorYInImage, 10);
  if (cursorLeft < 0) {
    cursorLeft = 0;
  }
  if (cursorTop < 0) {
    cursorTop = 0;
  }
  let cursorStyle = document.getElementById("cursor").style;
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
  let vboxVal = getViewboxAtTime(time);
  if (vboxVal !== undefined) {
    setTransform(time);
    let svgfile = getSVGFile();
    svgfile.setAttribute('viewBox', vboxVal);
  }
};

function getImageAtTime(time) {
  let currentTime = parseFloat(time);
  for (var key in imageAtTime) {
    if (imageAtTime.hasOwnProperty(key)) {
      let keyArray = key.split(",");
      if ((parseFloat(keyArray[0]) <= currentTime) && (parseFloat(keyArray[1]) > currentTime)) {
        return imageAtTime[key];
      }
    }
  }
};

function getShapesAtTime(time) {
  let shapesAtTime = timestampToId[time];
  let shapes = [];
  if (shapesAtTime != undefined) {
    for (var i = 0; i < shapesAtTime.length; i++) {
      let id = shapesAtTime[i];
      let shape = getSVGFile().getElementById(id);
      // If there is actually a new shape to be displayed
      if (shape !== null) {
        // Get actual shape tag for this specific time of playback
        shape = shape.getAttribute("shape");
        shapes.push(shape);
      }
    }
  }
  return shapes;
};

function getViewboxAtTime(time) {
  let currentTime = parseFloat(time);
  let showDeskshare = getDeskshareAtTime(time);
  for (var key in vboxValues) {
    if (vboxValues.hasOwnProperty(key)) {
      var keyArray = key.split(",");
      if (keyArray[1] == "end") {
        return showDeskshare ? adaptViewBoxToDeskshare(time) : vboxValues[key];
      } else if ((parseFloat(keyArray[0]) <= currentTime) && (parseFloat(keyArray[1]) >= currentTime)) {
        return showDeskshare ? adaptViewBoxToDeskshare(time) : vboxValues[key];
      }
    }
  }
};

function setSlideAspect(time, imageWidth, imageHeight) {
  let showDeskshare = getDeskshareAtTime(time);
  let aspectAtTime = getAspectAtTime(time);
  if (aspectAtTime != undefined && aspectAtTime != 0 && !showDeskshare) {
    currentSlideAspect = aspectAtTime;
  } else {
    currentSlideAspect = parseFloat((imageWidth / imageHeight));
  }
};

function getAspectAtTime(time) {
  let currentTime = parseFloat(time);
  for (var key in slideAspectValues) {
    if (slideAspectValues.hasOwnProperty(key)) {
      let keyArray = key.split(",");
      if (keyArray[1] == "end") {
        return slideAspectValues[key];
      } else if ((parseFloat(keyArray[0]) <= currentTime) && (parseFloat(keyArray[1]) >= currentTime)) {
        return slideAspectValues[key];
      }
    }
  }
};

function getCursorAtTime(time) {
  let coords = cursorValues[time];
  if (coords) return coords.split(' ');
};

function removeSlideChangeAttribute() {
  $('#video').removeAttr('slide-change');
  Popcorn('#video').unlisten(Popcorn.play, 'removeSlideChangeAttribute');
};

function getDeskshareAtTime(time) {
  let show = false;
  if (hasDeskshare) {
    for (var m = 0; m < deskshareEvents.length; m++) {
      let startTimestamp = deskshareEvents[m][0];
      let stopTimestamp = deskshareEvents[m][1];
      if (time >= startTimestamp && time <= stopTimestamp)
        show = true;
    }
  }
  return show;
};

function getDeskshareDimensionAtTime(time) {
  let startTimestamp = 0.0;
  let stopTimestamp = 0.0;
  let width = deskshareWidth;
  let height = deskshareHeight;
  if (hasDeskshare) {
    for (var m = 0; m < deskshareEvents.length; m++) {
      startTimestamp = deskshareEvents[m][0];
      stopTimestamp = deskshareEvents[m][1];
      if (time >= startTimestamp && time <= stopTimestamp) {
        width = deskshareEvents[m][2];
        height = deskshareEvents[m][3];
        break;
      }
    }
  }
  return {width: width, height: height};
};

function handlePresentationAreaContent(time) {
  if (time >= meetingDuration) return;
  let showDeskshare = getDeskshareAtTime(time);
  if (showDeskshare) {
    if (!isDeskshareActive) {
      logger.info("==Showing deskshare");
      isDeskshareActive = true;
      document.getElementById("deskshare-video").style.visibility = "visible";
      $('#slide').addClass('no-background');
    }
    resizeDeskshare();
  } else {
    if (isDeskshareActive) {
      logger.info("==Hiding deskshare");
      document.getElementById("deskshare-video").style.visibility = "hidden";
      $('#slide').removeClass('no-background');
      isDeskshareActive = false;
    }
    resizeSlide();
  }
};

function startLoadingBar() {
  logger.info("==Hide playback content");
  $("#playback-content").css('visibility', 'hidden');
  Pace.once('done', function() {
    // This is a hack to handle data from storage services
    function checkPlaybackLoaded() {
      if (firstLoad) {
        setTimeout(checkPlaybackLoaded, 250);
      } else {
        logger.info("==Loading done");
        onLoadComplete(true);
        resizeComponents();
      }
    }
    checkPlaybackLoaded();
  });
  Pace.start();
  showLoadingMessage();
};

function onLoadComplete(success) {
  if (success) {
    document.title = "Recording Playback";
    hideLoadingMessage();
    logger.info("==Show playback content");
    $("#playback-content").css('visibility', 'visible');
  } else {
    document.title = "Error";
    Pace.off('done');
    Pace.stop();
    showLoadingErrorMessage();
  }
};

function showLoadingErrorMessage() {
  document.getElementById("load-msg").innerHTML = "Recording not found";
  $("#loading").css('visibility', 'visible');
};

function showLoadingMessage() {
  document.getElementById("load-img").classList.add('animate');
  $("#loading").css('visibility', 'visible');
};

function hideLoadingMessage() {
  $("#loading").css('visibility', 'hidden');
  $("#loading").css('height','0');
};

// Find the key in the timestampToId object of the last entry at or before the provided timestamp
var timestampToIdLookup = function(t) {
  "use strict";
  t = (t * 10) | 0; // keys are in deciseconds as integers
  var minIndex = 0;
  var maxIndex = timestampToIdKeys.length - 1;
  var curIndex;
  var curElement;

  // I can't think of any better way to do this than just binary search.
  while (minIndex <= maxIndex) {
    curIndex = (minIndex + maxIndex) / 2 | 0;
    curElement = timestampToIdKeys[curIndex];
    if (curElement < t) {
      minIndex = curIndex + 1;
    } else if (curElement > t) {
      maxIndex = curIndex - 1;
    } else {
      return curElement;
    }
  }
  return timestampToIdKeys[maxIndex];
}

function runPopcorn() {
  logger.info("==Running popcorn");
  var p = new Popcorn("#video");
  p.code({
    start: 0,
    end: p.duration(),
    onFrame: function(options) {
      "use strict";
      var currentTime = p.currentTime();
      if ((!p.paused() || p.seeking()) && (Math.abs(currentTime - lastFrameTime) >= 0.1)) {
        lastFrameTime = currentTime;
        // Get the time and round to 1 decimal place
        var t = currentTime.toFixed(1);
        let currentShapes = getShapesAtTime(t);

        // Create an object referencing the main versions of all the shapes
        var current_shapes = Object.create(mainShapeIds);
        // And update it with current state of currently being drawn shapes
        get_shapes_in_time(t, current_shapes);

        // Update shape visibility status
        for (var i = 0; i < shapesArray.length; i++) {
          var a_shape = shapesArray[i];
          var time = parseFloat(a_shape.getAttribute('timestamp'));
          var shapeId = a_shape.getAttribute('id');
          var shape_i = a_shape.getAttribute('shape');
          var undo = parseFloat(a_shape.getAttribute('undo'));

          let shape = getSVGFile().getElementById(shapesArray[i].getAttribute("id"));

          if (shape != null) {
            if (
                // It's not the current version of the shape
                (shapeId != current_shapes[shape_i]) ||
                // It's in the future
                (time > t) ||
                // It's in the past (undo or clear)
                ((undo != -1) && (undo < currentTime))) {
              shape.style.visibility = 'hidden';
            } else {
              shape.style.visibility = 'visible';
            }
          }
        }

        // Fetch the name of the image at this time
        let nextImageId = getImageAtTime(t);
        // Changing slide image
        if (currentImageId && (currentImageId !== nextImageId) && (nextImageId !== undefined)) {
          logger.debug("==Changing image", nextImageId);
          var img = getSVGFile().getElementById(currentImageId);
          var ni = getSVGFile().getElementById(nextImageId);
          if (img) {
            img.style.visibility = "hidden";
          }
          // Destroy old plain text
          document.getElementById("slideText").innerHTML = "";
          if (ni) {
            ni.style.visibility = "visible";
          }
          // Set new plain text
          document.getElementById("slideText").innerHTML = slidePlainText[nextImageId] + nextImageId;
          if ($("#accEnabled").is(':checked')) {
            // Pause the playback on slide change
            p.pause();
            $('#video').attr('slide-change', 'slide-change');
            p.listen(Popcorn.play, removeSlideChangeAttribute);
          }
          let currentCanvas = getCanvasFromImage(currentImageId);
          if (currentCanvas !== null) {
            currentCanvas.setAttribute("display", "none");
          }
          let nextCanvas = getCanvasFromImage(nextImageId);
          if ((nextCanvas !== undefined) && (nextCanvas != null)) {
            nextCanvas.setAttribute("display", "");
          }
          currentImageId = nextImageId;
        }

        let image = getSVGFile().getElementById(currentImageId);
        if (image) {
          var imageWidth = parseFloat(image.getAttribute("width"));
          var imageHeight = parseFloat(image.getAttribute("height"));
          setViewBox(t);
          setSlideAspect(t, imageWidth, imageHeight);
          currentCursorVal = getCursorAtTime(t);
          if (currentCursorVal != null && currentCursorVal != undefined && !$('#slide').hasClass('no-background')) {
            var cursorX = parseFloat(currentCursorVal[0]);
            var cursorY = parseFloat(currentCursorVal[1]);
            if (cursorX >= 0 && cursorY >= 0) {
              showCursor(true);
              drawCursor(cursorX, cursorY);
            } else {
              showCursor(false);
            }
          }
          // Store the current slide
          currentImage = image;
        }
        handlePresentationAreaContent(t);
      }
    }
  });
};

function clearTransform() {
  logger.debug("==Cleaning canvas transformation");
  widthScale = 1;
  heightScale = 1;
  widthTranslate = 0;
  heightTranslate = 0;
  canvasTransformed = false;
};

function setDeskshareScale(originalVideoWidth, originalVideoHeight) {
  widthScale = originalVideoWidth / deskshareWidth;
  heightScale = originalVideoHeight / deskshareHeight;
};

function setDeskshareTranslate(originalVideoWidth, originalVideoHeight) {
  widthTranslate = (deskshareWidth - originalVideoWidth) / 2;
  heightTranslate = (deskshareHeight - originalVideoHeight) / 2;
};

// Deskshare viewBox has the information to transform the canvas to place it above the video
function adaptViewBoxToDeskshare(time) {
  let dimension = getDeskshareDimensionAtTime(time);
  setDeskshareScale(dimension.width, dimension.height);
  setDeskshareTranslate(dimension.width, dimension.height);

  let viewBox = "0.0 0.0 " + deskshareWidth + " " + deskshareHeight;
  return viewBox;
};

function getCanvasFromImage(image) {
  let canvasId = "canvas" + image.substr(5);
  return getSVGFile().getElementById(canvasId);
};

function getDeskshareImage() {
  let images = getSVGFile().getElementsByTagName("image");
  for (var i = 0; i < images.length; i++) {
    let element = images[i];
    let id = element.getAttribute("id");
    let href = element.getAttribute("xlink:href");
    if (href != null && href.indexOf("deskshare") !=-1) {
      return id;
    }
  }
  return "image0";
};

// Transform canvas to fit the different deskshare video sizes
function setTransform(time) {
  if (deskshareImage == null) {
    deskshareImage = getDeskshareImage();
  }
  if (getDeskshareAtTime(time)) {
    logger.debug("==Transforming annotation canvas");
    let canvas = getCanvasFromImage(deskshareImage);
    if (canvas !== null) {
      let scale = "scale(" + widthScale.toString() + ", " + heightScale.toString() + ")";
      let translate = "translate(" + widthTranslate.toString() + ", " + heightTranslate.toString() + ")";
      let transform = translate + " " + scale;
      canvas.setAttribute('transform', transform);
      canvasTransformed = true;
    }
  } else if (canvasTransformed) {
    clearTransform();
  }
};

function defineStartTime() {
  logger.info("==Defining start time");

  if (params.t === undefined)
    return 0;

  let extractNumber = /\d+/g;
  let extractUnit = /\D+/g;
  let startTime = 0;

  while (true) {
    let param1 = extractUnit.exec(params.t);
    let param2 = extractNumber.exec(params.t);
    if (param1 == null || param2 == null)
      break;

    let unit = String(param1).toLowerCase();
    let value = parseInt(String(param2));

    if (unit == "h")
      value *= 3600;
    else if (unit == "m")
      value *= 60;

    startTime += value;
  }

  logger.info("==Start time", startTime);
  return startTime;
};

function asyncRequest(method, url) {
  return new Promise(function (resolve, reject) {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.onload = function () {
      if (xhr.readyState !== xhr.DONE) {
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr);
      } else {
        reject({status: xhr.status, statusText: xhr.statusText});
      }
    };
    xhr.onerror = function () {
      reject({status: xhr.status, statusText: xhr.statusText});
    };
    xhr.send();
  });
};

function loadMetadata() {
  asyncRequest('GET', metadataXML).then(function (response) {
    processMetadataXML(response);
  }).catch(function(error) {
    logger.error("==Couldn't load metadata.xml", error);
    onLoadComplete(false);
  });
};

function processMetadataXML(response) {
  logger.info("==Processing metadata.xml");
  metadataXMLContent = response.responseXML;
  let metadata = metadataXMLContent.getElementsByTagName("meta");
  if (metadata.length > 0) {
    metadata = metadata[0];
    let meetingName = metadata.getElementsByTagName("meetingName");
    if (meetingName.length > 0) {
      $("#recording-title").text(meetingName[0].textContent);
      $("#recording-title").attr("title", meetingName[0].textContent);
    }
  }
  document.dispatchEvent(new CustomEvent('content-ready', {'detail': 'metadata'}));
};

function loadData() {
  asyncRequest('GET', shapesSVG).then(function (response) {
    processShapesSVG(response);
  }).catch(function(error) {
    logger.error("==Couldn't load shapes.svg", error);
  });

  asyncRequest('GET', panzoomsXML).then(function (response) {
    processPanzoomsXML(response);
  }).catch(function(error) {
    logger.error("==Couldn't load panzoom.xml", error);
  });

  asyncRequest('GET', cursorXML).then(function (response) {
    processCursorXML(response);
  }).catch(function(error) {
    logger.error("==Couldn't load cursor.xml", error);
  });

  asyncRequest('GET', deskshareXML).then(function (response) {
    processDeskshareXML(response);
  }).catch(function(error) {
    logger.error("==Couldn't load deskshare.xml", error);
  });
};

function processPanzoomsXML(response) {
  logger.info("==Processing panzooms.xml");
  let panelements = response.responseXML.getElementsByTagName("recording");
  let panZoomArray = panelements[0].getElementsByTagName("event");
  viewBoxes = response.responseXML.getElementsByTagName("viewBox");
  let pzlen = panZoomArray.length;
  let secondVal;
  for (var k = 0;k < pzlen; k++) {
    if (panZoomArray[k+1] == undefined) {
      secondVal = "end";
    } else {
      secondVal = panZoomArray[k+1].getAttribute("timestamp");
    }
    vboxValues[[panZoomArray[k].getAttribute("timestamp"), secondVal]] = viewBoxes[k].childNodes[0].data;
  }
  document.dispatchEvent(new CustomEvent('data-ready', {'detail': 'panzoom'}));
};

function processCursorXML(response) {
  logger.info("==Processing cursor.xml");
  let curelements = response.responseXML.getElementsByTagName("recording");
  let cursorArray = curelements[0].getElementsByTagName("event");
  let coords = response.responseXML.getElementsByTagName("cursor");
  let clen = cursorArray.length;
  if (cursorArray.length != 0) cursorValues["0"] = "0 0";
  for (var m = 0; m < clen; m++) {
    cursorValues[cursorArray[m].getAttribute("timestamp")] = coords[m].childNodes[0].data;
  }
  document.dispatchEvent(new CustomEvent('data-ready', {'detail': 'cursor'}));
};

function processShapesSVG(response) {
  logger.info("==Processing shapes.svg");
  let svgobj = document.createElement('div');
  $(svgobj).css('height', '100%');
  $(svgobj).css('width', '100%');
  // for some reason, innerHTML was dropping part of the svg file, while it works
  // fine when using Ajax html method
  // svgobj.innerHTML = response.responseText;
  $(svgobj).html(response.responseText);

  // Update the links inside of the presentation to include the full URL
  $(svgobj).find('image').each(function() {
    let href = $(this).attr('xlink:href');
    href = url + '/' + href;
    $(this).attr('xlink:href', href);
  });

  // Clear the style, we're setting it via css
  $(svgobj).find('svg').attr('style', '');
  document.getElementById('slide').appendChild(svgobj);
  $("#svgfile").css('height', '100%');
  $("#svgfile").css('width', '100%');

  shapesSVGContent = response.responseXML;

  // Getting all the event tags
  let shapeelement = response.responseXML.getElementsByTagName("svg")[0];
  // Get an array of the elements for each "shape" in the drawing
  let shapesArray = response.responseXML.querySelectorAll('g[class="shape"]');

  // To assist in finding the version of a shape shown at a particular time
  // (while being drawn, during updates), provide a lookup from time to id
  // Also save the id of the last version of each shape as its main id
  var timestampToId = {};
  var timestampToIdKeys = [];
  var mainShapeIds = {};
  for (var j = 0; j < shapesArray.length; j++) {
    shape = shapesArray[j];
    var id = shape.getAttribute('id');
    var shape_i = shape.getAttribute('shape');
    var time = (parseFloat(shape.getAttribute('timestamp')) * 10) | 0;

    if (timestampToId[time] == undefined) {
      timestampToId[time] = [];
      timestampToIdKeys.push(time);
    }
    timestampToId[time].push({id: id, shape: shape_i})

    mainShapeIds[shape_i] = id;
  }

  asyncRequest('GET', textJSON).then(function (response) {
    processTextJSON(response);
    processSlideAspectTimes();
    document.dispatchEvent(new CustomEvent('data-ready', {'detail': 'text'}));
  }).catch(function(error) {
    logger.warn("==Couldn't load presentation_text.json", error);
    processTextFallback();
    processSlideAspectTimes();
    document.dispatchEvent(new CustomEvent('data-ready', {'detail': 'text'}));
  });

  document.dispatchEvent(new CustomEvent('data-ready', {'detail': 'svg'}));
};

function processDeskshareXML(response) {
  logger.info("==Processing deskshare.xml");
  let deskshareElements = response.responseXML.getElementsByTagName("recording");
  let deskshareArray = deskshareElements[0].getElementsByTagName("event");
  if (deskshareArray != null && deskshareArray.length != 0) {
    for (var m = 0; m < deskshareArray.length; m++) {
      let deskshareEvent = [
          parseFloat(deskshareArray[m].getAttribute("start_timestamp")),
          parseFloat(deskshareArray[m].getAttribute("stop_timestamp")),
          parseFloat(deskshareArray[m].getAttribute("video_width")),
          parseFloat(deskshareArray[m].getAttribute("video_height"))
      ];
      deskshareEvents[m] = deskshareEvent;
    }
  }
  document.dispatchEvent(new CustomEvent('data-ready', {'detail': 'deskshare-xml'}));
};

function checkMediaURL(url) {
  var xhr = new XMLHttpRequest();
  xhr.open('HEAD', url, true);
  xhr.onreadystatechange = function (e) {
    if (xhr.readyState === 4) {
      if (xhr.status == 200 || xhr.status == 206) {
        var pathname = new URL(xhr.responseURL).pathname;
        if (pathname.endsWith("webcams.webm") || pathname.endsWith("webcams.mp4")) {
          logger.info("==Found video", pathname);
          hasVideo = true;
        } else if (pathname.endsWith("deskshare.webm") || pathname.endsWith("deskshare.mp4")) {
          logger.info("==Found deskshare", pathname);
          hasDeskshare = true;
        }
      }
      mediasToCheck--;
      if (mediasToCheck == 0) {
        document.dispatchEvent(new CustomEvent('content-ready', {'detail': 'medias-checked'}));
      }
    }
  };
  xhr.send();
};

function checkMedias() {
  for (var i = 0 ; i < mediasURL.length ; i++) {
    checkMediaURL(url + mediasURL[i]);
  }
};

function initPopcorn() {
  firstLoad = false;
  generateThumbnails();

  var startTime = defineStartTime();

  Popcorn("#video").currentTime(startTime);
  if (hasDeskshare)
    Popcorn("#deskshare-video").currentTime(startTime);

  // Popcorn documentation suggests this way to get the duration,
  // since this information does not come with 'loadedmetadata' event.
  Popcorn("#video").cue(2, function() {
    meetingDuration = parseFloat(Popcorn("#video").duration().toFixed(1));
    logger.info("==Meeting duration (seconds)", meetingDuration);
  });
};

function processTextJSON(response) {
  logger.info("==Processing presentation_text.json");
  let slidesText = JSON.parse(response.responseText);
  let shapeElements = shapesSVGContent.getElementsByTagName("svg");
  let images = shapeElements[0].getElementsByClassName("slide");
  for (var m = 0; m < images.length; m++) {
    len = images[m].getAttribute("in").split(" ").length;
    for (var n = 0; n < len; n++) {
      imageAtTime[[images[m].getAttribute("in").split(" ")[n], images[m].getAttribute("out").split(" ")[n]]] = images[m].getAttribute("id");
    }
    // The logo at the start has no text attribute
    if (images[m].getAttribute("text")) {
      // Have to save the value because images array might go out of scope
      var imgId = images[m].getAttribute("id");
      // Text format: presentation/PRESENTATION_ID/textfiles/SLIDE_ID.txt
      var imgTxt = images[m].getAttribute("text").split("/");
      var presentationId = imgTxt[1];
      var slideId = imgTxt[3].split(".")[0];
      if (slidesText[presentationId] && slidesText[presentationId][slideId]) {
        slidePlainText[imgId] = $('<div/>').text(slidesText[presentationId][slideId]).html();
      } else {
        slidePlainText[imgId] = $('<div/>')
      }
    }
  }
};

function processTextFallback() {
  logger.info("==Processing slides.txt");
  var textPathToImgId = {};
  let shapeElements = shapesSVGContent.getElementsByTagName("svg");
  let images = shapeElements[0].getElementsByClassName("slide");

  for (var m = 0; m < images.length; m++) {
    len = images[m].getAttribute("in").split(" ").length;
    for (var n = 0; n < len; n++) {
      imageAtTime[[images[m].getAttribute("in").split(" ")[n], images[m].getAttribute("out").split(" ")[n]]] = images[m].getAttribute("id");
    }
    // The logo at the start has no text attribute
    if (images[m].getAttribute("text")) {

      var textPath = url + "/" + images[m].getAttribute("text");
      textPathToImgId[textPath] = images[m].getAttribute("id");

      getTextAsync(textPath,textPathToImgId);
    }
  }
};

function getTextAsync(textPath, textPathToImgId) {
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status == 200 || xhr.status == 206) {
        var pathname = new URL(xhr.responseURL).pathname;
        var imgId = textPathToImgId[pathname];
        slidePlainText[imgId] = $('<div/>').text(xhr.responseText).html();
      }
    }
  };
  xhr.open("GET", textPath, true);
  xhr.send(null);
};

function processSlideAspectTimes() {
  var lastAspectValue = 0;
  for (var key in vboxValues) {
    if (vboxValues.hasOwnProperty(key)) {
      var startTimestamp = key.split(",")[0];
      var stopTimestamp = key.split(",")[1];
      var vboxWidth = parseFloat(vboxValues[key].split(" ")[2]);
      var vboxHeight = parseFloat(vboxValues[key].split(" ")[3]);
      var aspectValue = processAspectValue(vboxWidth, vboxHeight, startTimestamp, lastAspectValue);
      slideAspectValues[[startTimestamp, stopTimestamp]] = aspectValue;
      lastAspectValue = aspectValue;
    }
  }
};

function processAspectValue(vboxWidth, vboxHeight, time, lastAspectValue) {
  logger.debug("==Processing presentation aspect");
  let imageId;
  if (time == "0.0") {
    // A little hack 'cause function getImageAtTime with time = 0.0 returns the background image...
    // We need the first slide instead
    logger.debug("==First image");
    imageId = "image1";
  } else {
    imageId = getImageAtTime(time);
    logger.debug("==Image", imageId);
  }

  if (imageId !== undefined) {
    let image = getSVGFile().getElementById(imageId);

    if (image) {
      if (getDeskshareAtTime(parseFloat(time))) {
        return lastAspectValue;
      }

      let imageWidth = parseFloat(image.getAttribute("width"));
      let imageHeight = parseFloat(image.getAttribute("height"));

      // Fit-to-width: returning vbox aspect
      if (vboxWidth == imageWidth && vboxHeight < imageHeight) {
        logger.debug("==Fit-to-width aspect detected");
        return parseFloat(vboxWidth/vboxHeight);
      } else if (vboxWidth == imageWidth && vboxHeight == imageHeight) {
        // Fit-to-page: returning image aspect
        logger.debug("==Fit-to-page aspect detected");
        return parseFloat(imageWidth/imageHeight);
      } else {
        // If it's not fit-to-width neither fit-to-page we return the previous aspect
        return lastAspectValue;
      }
    } else {
      logger.error("==No image for id", imageId);
      return lastAspectValue;
    }
  } else {
    logger.error("==Image undefined");
    return lastAspectValue;
  }
};

// A small hack to hide the cursor when resizing the window, so it's not
// misplaced while the window is being resized
window.onresize = function(event) {
  showCursor(false);
  resizeComponents();
  resizeSlide();
  resizeDeskshare();
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
function resizeSlide() {
  logger.debug("==Resizing slide");
  if (currentImage) {
    let $slide = $("#slide");
    let maxWidth = currentSlideAspect * $slide.parent().outerHeight();
    $slide.css("max-width", maxWidth);
    let maxHeight = $slide.parent().width() / currentSlideAspect;
    $slide.css("max-height", maxHeight);
    logger.debug("==Size", {maxWidth, maxHeight});
  } else {
    logger.debug("==Slide not ready");
  }
};

function resizeDeskshare() {
  if (!hasDeskshare) return;
  logger.debug("==Resizing deskshare");
  let deskshareVideo = document.getElementById("deskshare-video");
  let $deskshareVideo = $("#deskshare-video");
  // Deskshare may exist and not be initialized yet
  if ($deskshareVideo && deskshareVideo) {
    let videoWidth = parseInt(deskshareVideo.videoWidth, 10);
    let videoHeight = parseInt(deskshareVideo.videoHeight, 10);

    let aspectRatio = videoWidth/videoHeight;
    let maxWidth = aspectRatio * $deskshareVideo.parent().outerHeight();
    $deskshareVideo.css("max-width", maxWidth);

    let maxHeight = $deskshareVideo.parent().width() / aspectRatio;
    $deskshareVideo.css("max-height", maxHeight);
    logger.debug("==Size", {maxWidth, maxHeight});
  } else {
    logger.debug("==Deskshare not ready");
  }
};

function getSVGFile() {
  return $('svg')[0];
};

function linkChatToMedia() {
  logger.info("==Linking chat to media");
  // Popcorn lib uses the 'mediaLoaded' event to link the chat timeline to the video
  var event = document.createEvent("HTMLEvents");
  event.initEvent("mediaLoaded", true, true);
  document.dispatchEvent(event);
}

document.addEventListener('media-ready', function(event) {
  logger.debug("==Media ready", event.detail);
  if (mediaReady) return;
  switch(event.detail) {
    case 'video':
      videoReady = true;
      break;
    case 'captions':
      captionsReady = true;
      break;
    case 'audio':
      audioReady = true;
      break;
    case 'deskshare':
      deskshareReady = true;
      break;
    default:
      logger.warn("==Unhandled media-ready event", event.detail);
  }
  if ((audioReady || (videoReady && captionsReady)) && deskshareReady) {
    logger.info("==All medias can be played");
    linkChatToMedia();
    document.dispatchEvent(new CustomEvent('playback-ready', {'detail': 'media'}));
  }
}, false);

document.addEventListener('data-ready', function(event) {
  logger.debug("==Data ready", event.detail);
  if (dataReady) return;
  switch(event.detail) {
    case 'svg':
      svgReady = true;
      break;
    case 'text':
      textReady = true;
      break;
    case 'panzoom':
      panzoomReady = true;
      break;
    case 'cursor':
      cursorReady = true;
      break;
    case 'deskshare-xml':
      deskshareXMLReady = true;
      break;
    default:
      logger.warn("==Unhandled data-ready event", event.detail);
  }
  if (svgReady && textReady && panzoomReady && cursorReady && deskshareXMLReady) {
    document.dispatchEvent(new CustomEvent('playback-ready', {'detail': 'data'}));
  }
}, false);
