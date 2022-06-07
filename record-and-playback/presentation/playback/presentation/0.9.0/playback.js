/*

BigBlueButton open source conferencing system - http://www.bigbluebutton.org/

Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).

This program is free software; you can redistribute it and/or modify it under the
terms of the GNU Lesser General Public License as published by the Free Software
Foundation; either version 3.0 of the License, or (at your option) any later
version.

BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License along
with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.

*/

goToSlide = function(time) {
  var pop = Popcorn("#video");
  pop.currentTime(time);
};

getUrlParameters = function() {
  var map = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
    map[key] = value;
  });
  return map;
};

/*
 * From: http://stackoverflow.com/questions/1634748/how-can-i-delete-a-query-string-parameter-in-javascript/4827730#4827730
 */
removeUrlParameter = function(url, param) {
  var urlparts= url.split('?');
  if (urlparts.length>=2) {
    var prefix= encodeURIComponent(param)+'=';
    var pars= urlparts[1].split(/[&;]/g);
    for (var i=pars.length; i-- > 0;) {
      if (pars[i].indexOf(prefix, 0)==0)
        pars.splice(i, 1);
    }
    if (pars.length > 0) {
      return urlparts[0]+'?'+pars.join('&');
    } else {
      return urlparts[0];
    }
  } else {
    return url;
  }
}

addUrlParameter = function(url, param, value) {
  var s = encodeURIComponent(param) + '=' + encodeURIComponent(value);
  console.log('Adding URL parameter ' + s);
  if (url.indexOf('?') == -1) {
    return url + '?' + s;
  } else {
    return url + '&' + s;
  }
}

/*
 * Converts seconds to HH:MM:SS
 * From: http://stackoverflow.com/questions/6312993/javascript-seconds-to-time-with-format-hhmmss#6313008
 */
secondsToHHMMSS = function(secs) {
  var hours   = Math.floor(secs / 3600);
  var minutes = Math.floor((secs - (hours * 3600)) / 60);
  var seconds = secs - (hours * 3600) - (minutes * 60);

  if (hours   < 10) {hours   = "0"+hours;}
  if (minutes < 10) {minutes = "0"+minutes;}
  if (seconds < 10) {seconds = "0"+seconds;}
  var time    = hours+':'+minutes+':'+seconds;
  return time;
}

secondsToYouTubeFormat = function(secs) {
  var hours   = Math.floor(secs / 3600);
  var minutes = Math.floor((secs - (hours * 3600)) / 60);
  var seconds = secs - (hours * 3600) - (minutes * 60);

  var time = "";
  if (hours > 0)   {time += hours+"h";}
  if (minutes > 0) {time += minutes+"m";}
  if (seconds > 0) {time += seconds+"s";}
  if (secs == 0) {time = "0s";}

  return time;
}

/*
 * Full word version of the above function for screen readers
 */
secondsToHHMMSSText = function(secs) {
  var hours   = Math.floor(secs / 3600);
  var minutes = Math.floor((secs - (hours * 3600)) / 60);
  var seconds = secs - (hours * 3600) - (minutes * 60);

  var time = "";
  if (hours   > 1) {time += hours   + " hours ";}
  else if (hours   == 1) {time += hours   + " hour ";}
  if (minutes > 1) {time += minutes + " minutes ";}
  else if (minutes == 1) {time += minutes + " minute ";}
  if (seconds > 1) {time += seconds + " seconds ";}
  else if (seconds == 1) {time += seconds + " second ";}

  return time;
}

replaceTimeOnUrl = function(secs) {
  var newUrl = addUrlParameter(removeUrlParameter(document.URL, 't'), 't', secondsToYouTubeFormat(secs));
  window.history.replaceState({}, "", newUrl);
}

var params = getUrlParameters();
var MEETINGID = params['meetingId'];
var RECORDINGS = "/presentation/" + MEETINGID;
var SLIDES_XML = RECORDINGS + '/slides_new.xml';
var SHAPES_SVG = RECORDINGS + '/shapes.svg';
var hasVideo = false;
var syncing = false;
var masterVideoSeeked = false;
var primaryMedia;
var secondaryMedias;
var allMedias;

/*
 * Sets the title attribute in a thumbnail.
 */
setTitleOnThumbnail = function($thumb) {
  var src = $thumb.attr("src")
  if (src !== undefined) {
    var num = "?";
    var name = "undefined";
    var match = src.match(/slide-(.*).png/);
    if (match) { num = match[1]; }
    match = src.match(/([^/]*)\/slide-.*\.png/);
    if (match) { name = match[1]; }
    $thumb.attr("title", name + " (" + num + ")");
  }
}

/*
 * Associates several events on a thumbnail, e.g. click to change slide,
 * mouse over/out functions, etc.
 */
setEventsOnThumbnail = function($thumb) {

  // Note: use ceil() so it jumps to a part of the video that actually is showing
  // this slide, while floor() would most likely jump to the previously slide

  // Popcorn event to mark a thumbnail when its slide is being shown
  var timeIn = $thumb.attr("data-in");
  var timeOut = $thumb.attr("data-out");
  var pop = Popcorn("#video");
  pop.code({
    start: timeIn,
    end: timeOut,
    onStart: function(options) {
      $parent = $(".thumbnail-wrapper").removeClass("active");
      $parent = $("#thumbnail-" + Math.ceil(options.start)).parent();
      $parent.addClass("active");
      animateToCurrentSlide();
    },
    onEnd: function(options) {
      $parent = $("#thumbnail-" + Math.ceil(options.start)).parent();
      $parent.removeClass("active");
    }
  });

  // Click on thumbnail changes the slide in popcorn
  $thumb.parent().on("click", function() {
    var time = Math.ceil($thumb.attr("data-in"));
    goToSlide(time);
    replaceTimeOnUrl(time);
  });

  // Mouse over/out to show/hide the label over the thumbnail
  $wrapper = $thumb.parent();
  $wrapper.on("mouseover", function() {
    $(this).addClass("hovered");
  });
  $wrapper.on("mouseout", function() {
    $(this).removeClass("hovered");
  });
};

var animateToCurrentSlide = function() {
  var $container = $("#thumbnails").parents(".left-off-canvas-menu");

  var currentThumb = $(".thumbnail-wrapper.active");
  // animate the scroll of thumbnails to center the current slide
  var thumbnailOffset = currentThumb.prop('offsetTop') - $container.prop('offsetTop') +
        (currentThumb.prop('offsetHeight') - $container.prop('offsetHeight')) / 2;
  $container.stop();
  $container.animate({ scrollTop: thumbnailOffset }, 200);
};

/*
 * Generates the list of thumbnails using shapes.svg
 */
generateThumbnails = function() {
  console.log("== Generating thumbnails");
  var xmlhttp;
  if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
  } else {// code for IE6, IE5
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  xmlhttp.open("GET", SHAPES_SVG, false);
  xmlhttp.send(null);

  if (xmlhttp.responseXML)
    var xmlDoc = xmlhttp.responseXML;
  else {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(xmlhttp.responseText, "image/svg+xml");
  }

  var elementsMap = {};
  var imagesList = new Array();

  xmlList = xmlDoc.getElementsByTagName("image");
  var slideCount = 0;

  console.log("== Setting title on thumbnails");
  for (var i = 0; i < xmlList.length; i++) {
    var element = xmlList[i];

    if (!$(element).attr("xlink:href"))
      continue;
    var src = RECORDINGS + "/" + element.getAttribute("xlink:href");
    if (src.match(/\/presentation\/.*slide-.*\.png/)) {
      var timeInList = xmlList[i].getAttribute("in").split(" ");
      var timeOutList = xmlList[i].getAttribute("out").split(" ");
      for (var j = 0; j < timeInList.length; j++) {

        var timeIn = Math.ceil(timeInList[j]);
        var timeOut = Math.ceil(timeOutList[j]);

        var img = $(document.createElement('img'));
        img.attr("src", src);
        img.attr("id", "thumbnail-" + timeIn);
        img.attr("data-in", timeIn);
        img.attr("data-out", timeOut);
        img.addClass("thumbnail");
        img.attr("alt", " ");
        img.attr("aria-hidden", "true"); //doesn't need to be focusable for blind users

        // a label with the time the slide starts
        var label = $(document.createElement('span'));
        label.addClass("thumbnail-label");
        label.attr("aria-hidden", "true"); //doesn't need to be focusable for blind users
        label.html(secondsToHHMMSS(timeIn));

        var hiddenDesc = $(document.createElement('span'));
        hiddenDesc.attr("id", img.attr("id") + "description");
        hiddenDesc.attr("class", "visually-hidden");
        hiddenDesc.html("Slide " + ++slideCount + " " + secondsToHHMMSSText(timeIn));

        // a wrapper around the img and label
        var div = $(document.createElement('div'));
        div.addClass("thumbnail-wrapper");
        div.attr("role", "link"); //tells accessibility software it can be clicked
        div.attr("aria-describedby", img.attr("id") + "description");
        div.append(img);
        div.append(label);
        div.append(hiddenDesc);

        if (parseFloat(timeIn) == 0) {
          div.addClass("active");
        }

        imagesList.push(timeIn);
        elementsMap[timeIn] = div;

        setEventsOnThumbnail(img);
        setTitleOnThumbnail(img);
      }
    }
  }

  imagesList.sort(function(a,b){return a - b});
  for (var i in imagesList) {
    $("#thumbnails").append(elementsMap[imagesList[i]]);
  }
}

function checkUrl(url)
{
  console.log("==Checking Url",url);
  var http = new XMLHttpRequest();
  http.open('HEAD', url, false);
  try {
    http.send();
  } catch(e) {
    return false;
  }
  return http.status == 200 || http.status == 206;
}

load_video = function(){
   console.log("==Loading video");
   //document.getElementById("video").style.visibility = "hidden"
   var video = document.createElement("video");
   video.setAttribute('id','video');
   video.setAttribute('class','webcam');

   var webmsource = document.createElement("source");
   webmsource.setAttribute('src', RECORDINGS + '/video/webcams.webm');
   webmsource.setAttribute('type','video/webm; codecs="vp8.0, vorbis"');
   video.appendChild(webmsource);

   // Try to load the captions
   // TODO this all should be done asynchronously...
   var capReq = new XMLHttpRequest();
   capReq.open('GET', RECORDINGS + '/captions.json', /*async=*/false);
   capReq.send();
   if (capReq.status == 200) {
     console.log("==Loading closed captions");
     // With sync request, responseType should always be blank (=="text")
     var captions = JSON.parse(capReq.responseText);
     for (var i = 0; i < captions.length; i++) {
       var track = document.createElement("track");
       track.setAttribute('kind', 'captions');
       track.setAttribute('label', captions[i]['localeName']);
       track.setAttribute('srclang', captions[i]['locale']);
       track.setAttribute('src', RECORDINGS + '/caption_' + captions[i]['locale'] + '.vtt');
       video.appendChild(track);
     }
   }

   /*var time_manager = Popcorn("#video");
   var pc_webcam = Popcorn("#webcam");
   time_manager.on( "timeupdate", function() {
    pc_webcam.currentTime( this.currentTime() );
   });*/

   video.setAttribute('data-timeline-sources', SLIDES_XML);
   //video.setAttribute('controls','');
   //leave auto play turned off for accessiblity support
   //video.setAttribute('autoplay','autoplay');

   document.getElementById("video-area").appendChild(video);

   Popcorn("#video").on("canplayall", function() {
      console.log("==Video loaded");
      document.dispatchEvent(new CustomEvent('media-ready', {'detail': 'video'}));
   });
}

load_audio = function() {
   console.log("Loading audio")
   var audio = document.createElement("audio") ;
   audio.setAttribute('id', 'video');

   // The webm file will work in IE with WebM components installed,
   // and should load faster in Chrome too
   var webmsource = document.createElement("source");
   webmsource.setAttribute('src', RECORDINGS + '/audio/audio.webm');
   webmsource.setAttribute('type', 'audio/webm; codecs="vorbis"');

   // Need to keep the ogg source around for compat with old recordings
   var oggsource = document.createElement("source");
   oggsource.setAttribute('src', RECORDINGS + '/audio/audio.ogg');
   oggsource.setAttribute('type', 'audio/ogg; codecs="vorbis"');

   // Browser Bug Workaround: The ogg file should be preferred in Firefox,
   // since it can't seek in audio-only webm files.
   if (navigator.userAgent.indexOf("Firefox") != -1) {
      audio.appendChild(oggsource);
      audio.appendChild(webmsource);
   } else {
      audio.appendChild(webmsource);
      audio.appendChild(oggsource);
   }

   audio.setAttribute('data-timeline-sources', SLIDES_XML);
   //audio.setAttribute('controls','');
   //leave auto play turned off for accessiblity support
   //audio.setAttribute('autoplay','autoplay');
   document.getElementById("audio-area").appendChild(audio);

   //remember: audio id is 'video'
   Popcorn("#video").on("canplayall", function() {
      console.log("==Audio loaded");
      document.dispatchEvent(new CustomEvent('media-ready', {'detail': 'audio'}));
   });
}

load_deskshare_video = function () {
   console.log("==Loading deskshare video");
   var deskshare_video = document.createElement("video");
   deskshare_video.setAttribute('id','deskshare-video');

   var webmsource = document.createElement("source");
   webmsource.setAttribute('src', RECORDINGS + '/deskshare/deskshare.webm');
   webmsource.setAttribute('type','video/webm; codecs="vp8.0, vorbis"');
   deskshare_video.appendChild(webmsource);

   var presentationArea = document.getElementById("presentation-area");
   presentationArea.insertBefore(deskshare_video,presentationArea.childNodes[0]);

   setSync();

   Popcorn("#deskshare-video").on("canplayall", function() {
      console.log("==Deskshare video loaded");
      document.dispatchEvent(new CustomEvent('media-ready', {'detail': 'deskshare'}));
   });
}

function setSync() {
   //master video
   primaryMedia = Popcorn("#video");

   //slave videos
   secondaryMedias = [ Popcorn("#deskshare-video") ];

   allMedias = [primaryMedia].concat(secondaryMedias);

   //when we play the master video, we play all other videos as well...
   primaryMedia.on("play", function() {
      for(i = 0; i < secondaryMedias.length ; i++)
         secondaryMedias[i].play();
   });

   //when we pause the master video, we sync
   primaryMedia.on("pause", function() {
      sync();
   });

   primaryMedia.on("seeking", function() {
      if(primaryMedia.played().length != 0)
         masterVideoSeeked = true;
   });

   //when finished seeking, we sync all medias...
   primaryMedia.on("seeked", function() {
      if(primaryMedia.paused())
         sync();
      else
         primaryMedia.pause();
   });


   for(i = 0; i < allMedias.length ; i++) {

       allMedias[i].on("waiting", function() {
          //if one of the medias is 'waiting', we must sync
          if(!primaryMedia.seeking() && !syncing) {
             syncing = true;
             //pause the master video, causing to pause and sync all videos...
             console.log("syncing videos...");
             primaryMedia.pause();
          }
       });


       allMedias[i].on("canplaythrough", function() {
          if(syncing || masterVideoSeeked) {
              var allMediasAreReady = true;
              for(i = 0; i < allMedias.length ; i++)
                  allMediasAreReady &= (allMedias[i].media.readyState == 4)

              if(allMediasAreReady) {
                 syncing = false;
                 masterVideoSeeked = false;
                 //play the master video, causing to play all videos...
                 console.log("resuming...");
                 primaryMedia.play();
              }
          }
       });
   }
}

function sync() {
  for(var i = 0; i < secondaryMedias.length ; i++) {
     if(secondaryMedias[i].media.readyState > 1) {
        secondaryMedias[i].pause();

        //set the current time will fire a "canplaythrough" event to tell us that the video can be played...
        secondaryMedias[i].currentTime(primaryMedia.currentTime());
     }
  }
}

load_script = function(file){
  console.log("==Loading script "+ file)
  script = document.createElement('script');
  script.src = file;
  script.type = 'text/javascript';
  document.getElementsByTagName('body').item(0).appendChild(script);
}

document.addEventListener("DOMContentLoaded", function() {
  console.log("==DOM content loaded");
  var appName = navigator.appName;
  var appVersion = navigator.appVersion;

  startLoadingBar();


  if (checkUrl(RECORDINGS + '/video/webcams.webm') == true) {
    hasVideo = true;
    $("#audio-area").attr("style", "display:none;");
    load_video();
  } else {
    hasVideo = false;
    $("#video-area").attr("style", "display:none;");
    load_audio();
  }

  //load up the acorn controls
  console.log("==Loading acorn media player ");
  $('#video').acornMediaPlayer({
    theme: 'bigbluebutton',
    volumeSlider: 'vertical'
  });
  $('#video').on("swap", function() {
    swapVideoPresentation();
  });

  if (checkUrl(RECORDINGS + '/deskshare/deskshare.webm') == true) {
    load_deskshare_video();
  } else {
    // If there is no deskshare at all we must also trigger this event to signal Popcorn
    document.dispatchEvent(new CustomEvent('media-ready', {'detail': 'deskshare'}));
  }

  resizeComponents();
}, false);

var secondsToWait = 0;

function addTime(time){
  if (secondsToWait === 0) {
    Popcorn('#video').pause();
    window.setTimeout("Tick()", 1000);
  }
  secondsToWait += time;
}

function Tick() {
  if (secondsToWait <= 0 || !($("#accEnabled").is(':checked'))) {
    secondsToWait = 0;
    Popcorn('#video').play();
    $('#countdown').html(""); // remove the timer
    return;
  }

  secondsToWait -= 1;
  $('#countdown').html(secondsToWait);
  window.setTimeout("Tick()", 1000);
}

// Swap the position of the DOM elements `elm1` and `elm2`.
function swapElements(elm1, elm2) {
  var parent1, next1,
      parent2, next2;

  parent1 = elm1.parentNode;
  next1   = elm1.nextSibling;
  parent2 = elm2.parentNode;
  next2   = elm2.nextSibling;

  parent1.insertBefore(elm2, next1);
  parent2.insertBefore(elm1, next2);
}

// Swaps the positions of the presentation and the video
function swapVideoPresentation() {
  var pop = Popcorn("#video");
  var wasPaused = pop.paused();

  var mainSectionChild = $("#main-section").children("[data-swap]");
  var sideSectionChild = $("#side-section").children("[data-swap]");
  swapElements(mainSectionChild[0], sideSectionChild[0]);
  resizeComponents();

  if (!wasPaused) {
    pop.play();
  }

  // hide the cursor so it doesn't appear in the wrong place (e.g. on top of the video)
  // if the cursor is currently being useful, he we'll be redrawn automatically soon
  showCursor(false);

  // wait for the svg with the slides to be fully loaded, then restore slides state and resize them
  function checkSVGLoaded() {
    var done = false;
    var svg = document.getElementsByTagName("object")[0];
    if (svg !== undefined && svg !== null && currentImage && svg.getSVGDocument('svgfile')) {
      var img = svg.getSVGDocument('svgfile').getElementById(currentImage.getAttribute("id"));
      if (img !== undefined && img !== null) {
        restoreSlidesState(img);
        done = true;
      }
    }
    if (!done) {
      setTimeout(checkSVGLoaded, 50);
    }
  }
  checkSVGLoaded();
}

function restoreSlidesState(img) {
  //set the current image as visible
  img.style.visibility = "visible";

  resizeSlides();
  restoreCanvas();

  var isPaused = Popcorn("#video").paused();
  if(isPaused) {
    restoreViewBoxSize();
    restoreCursor(img);
  }
}

function restoreCanvas() {
  var numCurrent = current_image.substr(5);
  var currentCanvas;
  if(svgobj.contentDocument) currentCanvas = svgobj.contentDocument.getElementById("canvas" + numCurrent);
  else currentCanvas = svgobj.getSVGDocument('svgfile').getElementById("canvas" + numCurrent);

  if(currentCanvas !== null) {
    currentCanvas.setAttribute("display", "");
  }
}

function restoreViewBoxSize() {
  var t = Popcorn("#video").currentTime().toFixed(1);
  var vboxVal = getViewboxAtTime(t);
  if(vboxVal !== undefined) {
    setViewBox(vboxVal);
  }
}

function restoreCursor(img) {
    var imageWidth = parseInt(img.getAttribute("width"), 10);
    var imageHeight = parseInt(img.getAttribute("height"), 10);
    showCursor(true);
    drawCursor(parseFloat(currentCursorVal[0]) / (imageWidth/2), parseFloat(currentCursorVal[1]) / (imageHeight/2), img);
}

// Manually resize some components we can't properly resize just using css.
// Mostly the components in the side-section, that has more than one component that
// need to fill 100% height.
function resizeComponents() {
  var availableHeight = $("body").height();
  if (hasVideo) {
    availableHeight -= $("#video-area .acorn-controls").outerHeight(true);
  } else {
    availableHeight -= $("#audio-area .acorn-controls").outerHeight(true);
  }
  availableHeight -= $("#navbar").outerHeight(true); // navbar

  // portrait mode
  if (window.innerHeight > window.innerWidth) {
    var height = availableHeight * 0.6; // 60% for top bar
    $("#main-section").outerHeight(height);
    availableHeight -= height;
    $("#side-section").outerHeight(availableHeight);

    var chatHeight = availableHeight;
    $("#chat-area").innerHeight(chatHeight);
  } else {
    // $("#playback-row").outerHeight(availableHeight);
    $("#main-section").outerHeight(availableHeight);
    $("#side-section").outerHeight(availableHeight);

    var chatHeight = availableHeight;
    chatHeight -= $("#side-section").children("[data-swap]").outerHeight(true);
    $("#chat-area").innerHeight(chatHeight);
  }
}

// Need to resize the elements in a few occasions:
// * Once the page and all assets are fully loaded
// * When the page is resized
// * When the video is fully loaded
$(window).resize(function() {
  resizeComponents();
});
document.addEventListener("load", function() {
  resizeComponents();
}, false);
function checkVideoLoaded() {
  var video = $('#video')[0];
  if (video !== undefined && video !== null && video.readyState === 4) {
    resizeComponents();
  } else {
    setTimeout(checkVideoLoaded, 50);
  }
}
checkVideoLoaded();
