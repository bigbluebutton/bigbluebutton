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
}

getUrlParameters = function() {
  var map = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
    map[key] = value;
  });
  return map;
}

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
  var newUrl = removeUrlParameter(document.URL, "t") + "&t=" + secondsToYouTubeFormat(secs);
  window.history.replaceState({}, "", newUrl);
}

var params = getUrlParameters();
var MEETINGID = params['meetingId'];
var RECORDINGS = "/presentation/" + MEETINGID;
var SLIDES_XML = RECORDINGS + '/slides_new.xml';
var SHAPES_SVG = RECORDINGS + '/shapes.svg';

/*
 * Sets the title attribute in a thumbnail.
 */
setTitleOnThumbnail = function($thumb) {
  var src = $thumb.attr("src")
  if (src !== undefined) {
    var num = "?";
    var name = "undefined";
    var match = src.match(/slide-(.*).png/)
    if (match) { num = match[1]; }
    match = src.match(/([^/]*)\/slide-.*\.png/)
    if (match) { name = match[1]; }
    $thumb.attr("title", name + " (" + num + ")")
  }
}

/*
 * Associates several events on a thumbnail, e.g. click to change slide,
 * mouse over/out functions, etc.
 */
setEventsOnThumbnail = function($thumb) {
  // Popcorn event to mark a thumbnail when its slide is being shown
  var timeIn = $thumb.attr("data-in");
  var timeOut = $thumb.attr("data-out");
  var pop = Popcorn("#video");
  pop.code({
    start: timeIn,
    end: timeOut,
    onStart: function( options ) {
      $parent = $("#thumbnail-" + options.start).parent();
      $parent.addClass("active");
      $(".thumbnail-label", $parent).show();

      animateToCurrentSlide();
    },
    onEnd: function( options ) {
      $parent = $("#thumbnail-" + options.start).parent();
      $parent.removeClass("active");
      $(".thumbnail-label", $parent).hide();
    }
  });

  // Click on thumbnail changes the slide in popcorn
  $thumb.parent().on("click", function() {
    goToSlide($thumb.attr("data-in"));
    replaceTimeOnUrl($thumb.attr("data-in"));
  });

  // Mouse over/out to show/hide the label over the thumbnail
  $wrapper = $thumb.parent();
  $wrapper.on("mouseover", function() {
    $(".thumbnail-label", $(this)).show();
  });
  $wrapper.on("mouseout", function() {
    if (!$(this).hasClass("active")) {
      $(".thumbnail-label", $(this)).hide();
    }
  });
}

$("input[name='autoscrollEnabled']").live('change', function() {
  animateToCurrentSlide();
});

animateToCurrentSlide = function(force) {
  force = typeof force !== 'undefined' ? force : false;

  if (force || isAutoscrollEnabled()) {
    var currentSlide = getCurrentSlide();
    // animate the scroll of thumbnails to center the current slide
    var thumbnailOffset = currentSlide.prop('offsetTop') - $("#thumbnails").prop('offsetTop') + (currentSlide.prop('offsetHeight') - $("#thumbnails").prop('offsetHeight')) / 2;
    $("#thumbnails").animate({ scrollTop: thumbnailOffset }, 'slow');
  }
}

isAutoscrollEnabled = function() {
  return $("input[name='autoscrollEnabled']").is(':checked');
}

setAutoscrollEnabled = function(value) {
  $('input[name=autoscrollEnabled]').attr('checked', value);
}

getCurrentSlide = function() {
  return $(".thumbnail-wrapper.active");
}

/*
 * Generates the list of thumbnails using shapes.svg
 */
generateThumbnails = function() {
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
  
  for (var i = 0; i < xmlList.length; i++) {
    var element = xmlList[i];
    
    if (!$(element).attr("xlink:href"))
      continue;
    var src = RECORDINGS + "/" + element.getAttribute("xlink:href");
    if (src.match(/\/presentation\/.*slide-.*\.png/)) {
      var timeInList = xmlList[i].getAttribute("in").split(" ");
      var timeOutList = xmlList[i].getAttribute("out").split(" ");

      for (var j = 0; j < timeInList.length; j++) {
        var timeIn = Math.floor(timeInList[j]);
        var timeOut = Math.floor(timeOutList[j]);
        
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

google_frame_warning = function(){
  var message = "To support this playback please install 'Google Chrome Frame', or use other browser: Firefox, Safari, Chrome, Opera";
  var line = document.createElement("p");
  var link = document.createElement("a");
  line.appendChild(document.createTextNode(message));
  link.setAttribute("href", "http://www.google.com/chromeframe")
  link.setAttribute("target", "_blank")
  link.appendChild(document.createTextNode("Install Google Chrome Frame"));
  document.getElementById("chat").appendChild(line);
  document.getElementById("chat").appendChild(link);
}
  
function checkUrl(url)
{
    console.log("Checking Url")
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status==200;
}

load_video = function(){
   console.log("Loading video")
   //document.getElementById("video").style.visibility = "hidden"  
   var video = document.createElement("video")   
   video.setAttribute('id','video');  
   video.setAttribute('class','webcam');  

   var webmsource = document.createElement("source");
   webmsource.setAttribute('src', RECORDINGS + '/video/webcams.webm');
   webmsource.setAttribute('type','video/webm; codecs="vp8.0, vorbis"');
   video.appendChild(webmsource);

   /*var time_manager = Popcorn("#video");
   var pc_webcam = Popcorn("#webcam");
   time_manager.on( "timeupdate", function() {
    pc_webcam.currentTime( this.currentTime() );
   });*/

   video.setAttribute('data-timeline-sources', SLIDES_XML);    
   //video.setAttribute('controls','');
   //leave auto play turned off for accessiblity support
   //video.setAttribute('autoplay','autoplay');

   document.getElementById("videoRecordingWrapper").appendChild(video);
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
   document.getElementById("audioRecordingWrapper").appendChild(audio);
}

load_script = function(file){
  console.log("Loading script "+ file)
  script = document.createElement('script');
  script.src = file;
  script.type = 'text/javascript';
  document.getElementsByTagName('body').item(0).appendChild(script);
}

document.addEventListener( "DOMContentLoaded", function() {
  var appName = navigator.appName;
  var appVersion = navigator.appVersion;
  //var video = document.getElementById("webcam");

  if (appName == "Microsoft Internet Explorer" && navigator.userAgent.match("chromeframe") == false ) {
    google_frame_warning
  }

  if (checkUrl(RECORDINGS + '/video/webcams.webm') == true){
      videoContainer = document.getElementById("audioRecordingWrapper").style.display = "none";
      load_video();
  }else{
      videoContainer = document.getElementById("videoRecordingWrapper").style.display = "none";       
      chat = document.getElementById("chat");
      chat.style.height = "600px";
      chat.style.backgroundColor = "white";      
      load_audio();
  }
  
  //load_audio();
  load_script("lib/writing.js");
  //generateThumbnails();

  //load up the acorn controls
  jQuery('#video').acornMediaPlayer({
    theme: 'darkglass',
    volumeSlider: 'vertical'
  });
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
