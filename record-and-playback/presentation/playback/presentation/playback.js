goToSlide = function(time) {
  var pop = Popcorn("#videoRecording");
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
  var pop = Popcorn("#videoRecording");
  pop.code({
    start: timeIn,
    end: timeOut,
    onStart: function( options ) {
      $parent = $("#thumbnail-" + options.start).parent();
      $parent.addClass("active");
      $(".thumbnail-label", $parent).show();
    },
    onEnd: function( options ) {
      $parent = $("#thumbnail-" + options.start).parent();
      $parent.removeClass("active");
      $(".thumbnail-label", $parent).hide();
    }
  });

  // Click on thumbnail changes the slide in popcorn
  $thumb.on("click", function() {
    goToSlide($thumb.attr("data-in"));
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
  
  for (var i = 0; i < xmlList.length; i++) {
    var element = xmlList[i];
    
    if (!element.hasAttribute("xlink:href"))
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

        // a label with the time the slide starts
        var label = $(document.createElement('span'));
        label.addClass("thumbnail-label");
        label.html(secondsToHHMMSS(timeIn));

        // a wrapper around the img and label
        var div = $(document.createElement('div'));
        div.addClass("thumbnail-wrapper");

        div.append(img);
        div.append(label);

//        $("#thumbnails").append(div);
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

document.addEventListener( "DOMContentLoaded", function() {
  var appName = navigator.appName;
  var appVersion = navigator.appVersion;
  var video = document.getElementById("videoRecording");
  if (appName == "Microsoft Internet Explorer") {
    if (navigator.userAgent.match("chromeframe")) {
      video.setAttribute('src', RECORDINGS + '/video/webcams.mp4');
      video.setAttribute('type','video/mp4');
    } else {
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
  } else if (appVersion.match("Safari") != null && appVersion.match("Chrome") == null) {
    video.setAttribute('src', RECORDINGS + '/video/webcams.mp4');
    video.setAttribute('type','video/mp4');
  } else {
    video.setAttribute('src', RECORDINGS + '/video/webcams.mp4');
    video.setAttribute('type','video/mp4');
  }
  video.setAttribute('data-timeline-sources', SLIDES_XML);
  
  generateThumbnails();
}, false);
