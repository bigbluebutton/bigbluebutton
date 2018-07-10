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

const defaultCopyright = '<p>Recorded with <a target="_blank" href="http://mconf.org/">Mconf</a>.</p><p>Use <a target="_blank" href="http://mozilla.org/firefox">Mozilla Firefox</a> or <a target="_blank" href="http://google.com/chrome/">Google Chrome</a> to play this recording.</p>';
const defaultLogo = 'logo.png';

// Playback events
var dataReady = false;
var mediaReady = false;
var contentReady = false;

// Content events
var DOMLoaded = false;
var metadataLoaded = false;
var mediasChecked = false;

// Media control
var hasVideo = false;
var hasDeskshare = false;
var mediaSyncing = false;
var mediaSeeked = false;
var primaryMedia;
var secondaryMedias;
var allMedias;

function goToSlide(time) {
  var pop = Popcorn("#video");
  pop.currentTime(time);
};

/*
 * From: http://stackoverflow.com/questions/1634748/how-can-i-delete-a-query-string-parameter-in-javascript/4827730#4827730
 */
function removeURLParameter(url, param) {
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
};

function addURLParameter(url, param, value) {
  var s = encodeURIComponent(param) + '=' + encodeURIComponent(value);
  logger.info("==Adding URL parameter", s);
  if (url.indexOf('?') == -1) {
    return url + '?' + s;
  } else {
    return url + '&' + s;
  }
};

/*
 * Converts seconds to HH:MM:SS
 * From: http://stackoverflow.com/questions/6312993/javascript-seconds-to-time-with-format-hhmmss#6313008
 */
function secondsToHHMMSS(secs) {
  var hours   = Math.floor(secs / 3600);
  var minutes = Math.floor((secs - (hours * 3600)) / 60);
  var seconds = secs - (hours * 3600) - (minutes * 60);

  if (hours   < 10) {hours   = "0"+hours;}
  if (minutes < 10) {minutes = "0"+minutes;}
  if (seconds < 10) {seconds = "0"+seconds;}
  var time    = hours+':'+minutes+':'+seconds;
  return time;
};

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
};

/*
 * Full word version of the above function for screen readers
 */
function secondsToHHMMSSText(secs) {
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
};

function replaceTimeOnURL(secs) {
  var newUrl = addURLParameter(removeURLParameter(document.URL, 't'), 't', secondsToYouTubeFormat(secs));
  window.history.replaceState({}, "", newUrl);
};

/*
 * Sets the title attribute in a thumbnail.
 */
function setTitleOnThumbnail($thumb) {
  var src = $thumb.attr("src");
  if (src !== undefined) {
    var num = "?";
    var name = "undefined";
    var match = src.match(/slide-(.*).png/);
    if (match) { num = match[1]; }
    match = src.match(/([^/]*)\/slide-.*\.png/);
    if (match) { name = match[1]; }
    $thumb.attr("title", name + " (" + num + ")");
  }
};

/*
 * Associates several events on a thumbnail, e.g. click to change slide,
 * mouse over/out functions, etc.
 */
function setEventsOnThumbnail($thumb) {
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
    replaceTimeOnURL(time);
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

function animateToCurrentSlide() {
  var $container = $("#thumbnails").parents(".left-off-canvas-menu");

  var currentThumb = $(".thumbnail-wrapper.active");
  // Animate the scroll of thumbnails to center the current slide
  var thumbnailOffset = currentThumb.prop('offsetTop') - $container.prop('offsetTop') +
      (currentThumb.prop('offsetHeight') - $container.prop('offsetHeight')) / 2;
  $container.stop();
  $container.animate({scrollTop: thumbnailOffset}, 200);
};

/*
 * Generates the list of thumbnails using shapes.svg
 */
function generateThumbnails() {
  logger.info("==Generating thumbnails");
  var elementsMap = {};
  var imagesList = new Array();

  xmlList = shapesSVGContent.getElementsByTagName("image");
  var slideCount = 0;

  logger.info("==Setting title on thumbnails");
  for (var i = 0; i < xmlList.length; i++) {
    var element = xmlList[i];

    if (!$(element).attr("xlink:href"))
      continue;

    var src = element.getAttribute("xlink:href");
    // If it's a full url, leave it as it is
    if (!src.match(/^http[s]?:\/\//)) {
      src = url + '/' + src;
    }
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
        // Doesn't need to be focusable for blind users
        img.attr("aria-hidden", "true");

        // A label with the time the slide starts
        var label = $(document.createElement('span'));
        label.addClass("thumbnail-label");
        // Doesn't need to be focusable for blind users
        label.attr("aria-hidden", "true");
        label.html(secondsToHHMMSS(timeIn));

        var hiddenDesc = $(document.createElement('span'));
        hiddenDesc.attr("id", img.attr("id") + "description");
        hiddenDesc.attr("class", "visually-hidden");
        hiddenDesc.html("Slide " + ++slideCount + " " + secondsToHHMMSSText(timeIn));

        // A wrapper around the img and label
        var div = $(document.createElement('div'));
        div.addClass("thumbnail-wrapper");
        // Tells accessibility software it can be clicked
        div.attr("role", "link");
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
};

function loadVideo() {
  logger.info("==Loading video");
  var video = document.createElement("video");
  video.setAttribute('id','video');
  video.setAttribute('class','webcam');
  video.setAttribute('preload','auto');

  let webmsource = document.createElement("source");
  webmsource.setAttribute('src', url + '/video/webcams.webm');
  webmsource.setAttribute('type','video/webm; codecs="vp8.0, vorbis"');
  video.appendChild(webmsource);

  let mp4source = document.createElement("source");
  mp4source.setAttribute('src', url + '/video/webcams.mp4');
  mp4source.setAttribute('type','video/mp4; codecs="avc1.42E01E"');
  video.appendChild(mp4source);

  video.setAttribute('data-timeline-sources', chatXML);

  asyncRequest('GET', captionsJSON).then(function (response) {
    logger.info("==Processing captions.json");
    var captions = JSON.parse(response.responseText);
    for (var i = 0; i < captions.length; i++) {
      var track = document.createElement("track");
      track.setAttribute('kind', 'captions');
      track.setAttribute('label', captions[i]['localeName']);
      track.setAttribute('srclang', captions[i]['locale']);
      track.setAttribute('src', url + '/caption_' + captions[i]['locale'] + '.vtt');
      video.appendChild(track);
    }
    document.dispatchEvent(new CustomEvent('media-ready', {'detail': 'captions'}));
  }, function (response) {
    logger.info("==Video has no captions");
    document.dispatchEvent(new CustomEvent('media-ready', {'detail': 'captions'}));
  });

  document.getElementById("video-area").appendChild(video);

  checkLoadedMedia();
};

function loadAudio() {
  logger.info("==Loading audio")
  var audio = document.createElement("audio") ;
  audio.setAttribute('id', 'video');
  audio.setAttribute('preload', 'auto');

  // The webm file will work in IE with WebM components installed,
  // and should load faster in Chrome too
  var webmsource = document.createElement("source");
  webmsource.setAttribute('src', url + '/audio/audio.webm');
  webmsource.setAttribute('type', 'audio/webm; codecs="vorbis"');

  // Need to keep the ogg source around for compat with old recordings
  var oggsource = document.createElement("source");
  oggsource.setAttribute('src', url + '/audio/audio.ogg');
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

  audio.setAttribute('data-timeline-sources', chatXML);
  // Audio.setAttribute('controls','');
  // Leave auto play turned off for accessiblity support
  // Audio.setAttribute('autoplay','autoplay');
  document.getElementById("audio-area").appendChild(audio);

  checkLoadedMedia();
};

function loadDeskshare() {
  logger.info("==Loading deskshare");
  var deskshareVideo = document.createElement("video");
  deskshareVideo.setAttribute('id','deskshare-video');
  deskshareVideo.setAttribute('preload','auto');

  var webmsource = document.createElement("source");
  webmsource.setAttribute('src', url + '/deskshare/deskshare.webm');
  webmsource.setAttribute('type','video/webm; codecs="vp8.0, vorbis"');
  deskshareVideo.appendChild(webmsource);

  var mp4source = document.createElement("source");
  mp4source.setAttribute('src', url + '/deskshare/deskshare.mp4');
  mp4source.setAttribute('type','video/mp4; codecs="avc1.42E01E"');
  deskshareVideo.appendChild(mp4source);

  var presentationArea = document.getElementById("presentation-area");
  presentationArea.insertBefore(deskshareVideo,presentationArea.childNodes[0]);

  setMediaSync();

  checkLoadedDeskshare();
};

function setMediaSync() {
  // Master video
  primaryMedia = Popcorn("#video");
  // Slave videos
  secondaryMedias = [Popcorn("#deskshare-video")];
  allMedias = [primaryMedia].concat(secondaryMedias);

  // When we play the master video, we play all other videos as well...
  primaryMedia.on("play", function() {
    for (i = 0; i < secondaryMedias.length ; i++) {
      secondaryMedias[i].play();
    }
  });

  // When we pause the master video, we sync
  primaryMedia.on("pause", function() {
    sync();
  });

  primaryMedia.on("seeking", function() {
    if (primaryMedia.played().length != 0) {
      mediaSeeked = true;
    }
  });

  // When finished seeking, we sync all medias...
  primaryMedia.on("seeked", function() {
    if (primaryMedia.paused()) {
      sync();
    } else {
      primaryMedia.pause();
    }
  });

  for (i = 0; i < allMedias.length ; i++) {
    allMedias[i].on("waiting", function() {
      // If one of the medias is 'waiting', we must sync
      if (!primaryMedia.seeking() && !mediaSyncing) {
        mediaSyncing = true;
        // Pause the master video, causing to pause and sync all videos...
        logger.debug("==Syncing videos");
        primaryMedia.pause();
      }
    });

    allMedias[i].on("canplay", function() {
      if (mediaSyncing || mediaSeeked) {
        var allMediasAreReady = true;
        for (i = 0; i < allMedias.length ; i++) {
          allMediasAreReady &= (allMedias[i].media.readyState == 4);
        }

        if (allMediasAreReady) {
          mediaSyncing = false;
          mediaSeeked = false;
          // Play the master video, causing to play all videos...
          logger.debug("==Resuming");
          primaryMedia.play();
        }
      }
    });
  }
};

function sync() {
  for (var i = 0; i < secondaryMedias.length ; i++) {
    if (secondaryMedias[i].media.readyState > 1) {
      secondaryMedias[i].pause();
      // Set the current time will fire a "canplay" event to tell us that the video can be played...
      secondaryMedias[i].currentTime(primaryMedia.currentTime());
    }
  }
};

function setMediaListeners() {
  // Solo media
  primaryMedia = Popcorn("#video");
  primaryMedia.on("seeking", function() {
    if (primaryMedia.played().length != 0) {
      mediaSeeked = true;
    }
  });

  // When finished seeking
  primaryMedia.on("seeked", function() {
    if (!primaryMedia.paused()) {
      primaryMedia.pause();
    }
  });

  primaryMedia.on("canplay", function() {
    if (mediaSeeked) {
      mediaSeeked = false;
      logger.debug("==Resuming");
      primaryMedia.play();
    }
  });
};

// Hack for mobile devices that not load media unless they are visible
function forceMediaEvents() {
  // When the medias were loaded
  if (mediaReady) return;
  if (hasVideo) {
    logger.debug("==Forcing video ready event");
    document.dispatchEvent(new CustomEvent('media-ready', {'detail': 'video'}));
  } else {
    logger.debug("==Forcing audio ready event");
    document.dispatchEvent(new CustomEvent('media-ready', {'detail': 'audio'}));
  }
  if (hasDeskshare) {
    logger.debug("==Forcing deskshare ready event");
    document.dispatchEvent(new CustomEvent('media-ready', {'detail': 'deskshare'}));
  }
}

document.addEventListener("DOMContentLoaded", function() {
  logger.info("==DOM content loaded");
  loadMetadata();
  checkMedias();
  document.dispatchEvent(new CustomEvent('content-ready', {'detail': 'dom'}));
}, false);

function loadPlayback() {
  logger.info("==Loading playback");
  var appName = navigator.appName;
  var appVersion = navigator.appVersion;

  // Hack to force mobile devices to show the playback when media do not load while hidden
  var isMobile = mobileAndTabletCheck();
  if (isMobile) {
    logger.info("==Device is mobile");
    setTimeout(forceMediaEvents, mobileTimeout);
  }

  startLoadingBar();
  loadData();
  loadBranding();

  if (hasVideo) {
    $("#audio-area").attr("style", "display:none;");
    loadVideo();
  } else {
    $("#video-area").attr("style", "display:none;");
    loadAudio();
  }

  // load up the acorn controls
  logger.info("==Loading acorn media player");
  $('#video').acornMediaPlayer({
    theme: 'bigbluebutton',
    volumeSlider: 'vertical'
  });
  $('#video').on("swap", function() {
    swapVideoPresentation();
  });

  if (hasDeskshare) {
    loadDeskshare();
  } else {
    setMediaListeners();
    logger.debug("==Recording has no deskshare");
    document.dispatchEvent(new CustomEvent('media-ready', {'detail': 'deskshare'}));
  }
};

function isMediaReady(media) {
  if (media !== undefined && media !== null && media.readyState === 4) {
    return true;
  }
  return false;
};

function checkLoadedMedia() {
  // We use the video tag both for audio or video
  let media = $('#video')[0];
  if (isMediaReady(media)) {
    if (hasVideo) {
      document.dispatchEvent(new CustomEvent('media-ready', {'detail': 'video'}));
    } else {
      document.dispatchEvent(new CustomEvent('media-ready', {'detail': 'audio'}));
    }
  } else {
    setTimeout(checkLoadedMedia, 250);
  }
};

function checkLoadedDeskshare() {
  let deskshare = $('#deskshare-video')[0];
  if (isMediaReady(deskshare)) {
    document.dispatchEvent(new CustomEvent('media-ready', {'detail': 'deskshare'}));
  } else {
    setTimeout(checkLoadedDeskshare, 250);
  }
};

var secondsToWait = 0;

function addTime(time){
  if (secondsToWait === 0) {
    Popcorn('#video').pause();
    window.setTimeout("Tick()", 1000);
  }
  secondsToWait += time;
};

function loadBranding() {
  let logo = undefined;
  let copyright = undefined;
  let metadata = metadataXMLContent.getElementsByTagName("meta");

  if (metadata.length > 0) {
    metadata = metadata[0];

    let logoCandidates = metadata.getElementsByTagName("mconf-live-playback-logo-url");
    if (logoCandidates.length > 0) {
      logo = logoCandidates[0].textContent;
    }

    let copyrightCandidates = metadata.getElementsByTagName("mconf-live-playback-copyright");
    if (copyrightCandidates.length > 0) {
      copyright = copyrightCandidates[0].textContent;
    }
  }

  loadLogo(logo);
  loadCopyright(copyright);
};

function loadLogo(logo) {
  let logoURL = typeof logo !== 'undefined' ? logo : defaultLogo;
  logger.info("==Loaded logo from", logoURL);
  $("#slide").css('background-image', 'url(' + logoURL + ')');
  document.getElementById("load-img").src = logoURL;
}

function loadCopyright(copyright) {
  let copyrightText = typeof copyright !== 'undefined' ? copyright : defaultCopyright;
  $("#copyright").html(copyrightText);
};

function Tick() {
  if (secondsToWait <= 0 || !($("#accEnabled").is(':checked'))) {
    secondsToWait = 0;
    Popcorn('#video').play();
    $('#countdown').html(""); // Remove the timer
    return;
  }

  secondsToWait -= 1;
  $('#countdown').html(secondsToWait);
  window.setTimeout("Tick()", 1000);
};

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

  resizeComponents();
};

// Swaps the positions of the presentation and the video
function swapVideoPresentation() {
  var pop = Popcorn("#video");
  var wasPaused = pop.paused();

  var mainSectionChild = $("#main-section").children("[data-swap]");
  var sideSectionChild = $("#side-section").children("[data-swap]");
  swapElements(mainSectionChild[0], sideSectionChild[0]);

  if (!wasPaused) {
    pop.play();
  }

  // Hide the cursor so it doesn't appear in the wrong place (e.g. on top of the video)
  // if the cursor is currently being useful, he we'll be redrawn automatically soon
  showCursor(false);

  // Wait for the svg with the slides to be fully loaded, then restore slides state and resize them
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
  };
  checkSVGLoaded();
};

function restoreSlidesState(img) {
  logger.debug("==Restoring slide state");
  // Set the current image as visible
  img.style.visibility = "visible";

  resizeSlide();
  restoreCanvas();

  var isPaused = Popcorn("#video").paused();
  if (isPaused) {
    restoreViewBoxSize();
    restoreCursor(img);
  }
};

function restoreCanvas() {
  logger.debug("==Restoring canvas");
  var numCurrent = currentImageId.substr(5);
  var currentCanvas;
  currentCanvas = getSVGElementById("canvas" + numCurrent);

  if (currentCanvas !== null) {
    currentCanvas.setAttribute("display", "");
  }
};

function restoreViewBoxSize() {
  logger.debug("==Restoring view box");
  var t = Popcorn("#video").currentTime().toFixed(1);
  var vboxVal = getViewboxAtTime(t);
  if (vboxVal !== undefined) {
    setViewBox(vboxVal);
  }
};

function restoreCursor(img) {
  logger.debug("==Restoring cursor");
  var imageWidth = parseInt(img.getAttribute("width"), 10);
  var imageHeight = parseInt(img.getAttribute("height"), 10);
  showCursor(true);
  drawCursor(parseFloat(currentCursorVal[0]) / (imageWidth/2), parseFloat(currentCursorVal[1]) / (imageHeight/2));
};

// Manually resize some components we can't properly resize just using css.
// Mostly the components in the side-section, that has more than one component that
// need to fill 100% height.
function resizeComponents() {
  logger.info("==Resizing components");
  let availableHeight = $("body").height();
  if (hasVideo) {
    availableHeight -= $("#video-area .acorn-controls").outerHeight(true);
  } else {
    availableHeight -= $("#audio-area .acorn-controls").outerHeight(true);
  }
  availableHeight -= $("#navbar").outerHeight(true);

  if (window.innerHeight > window.innerWidth) {
    logger.debug("==Portrait mode");
    let mainSectionHeight = availableHeight * 0.6; // 60% for top bar
    $("#main-section").outerHeight(mainSectionHeight);
    let sideSectionHeight = availableHeight - mainSectionHeight;
    $("#side-section").outerHeight(sideSectionHeight);
    $("#chat-area").innerHeight(sideSectionHeight);
  } else {
    logger.debug("==Landscape mode");
    $("#main-section").outerHeight(availableHeight);
    $("#side-section").outerHeight(availableHeight);
    logger.debug("==Data-swap children", $("#side-section").children("[data-swap]"));
    let chatHeight = availableHeight - $("#side-section").children("[data-swap]").outerHeight(true);
    $("#chat-area").innerHeight(chatHeight);
  }
};

document.addEventListener('content-ready', function(event) {
  logger.debug("==Content ready", event.detail);
  if (contentReady) return;
  switch(event.detail) {
    case 'dom':
      DOMLoaded = true;
      break;
    case 'metadata':
      metadataLoaded = true;
      break;
    case 'medias-checked':
      mediasChecked = true;
      break;
    default:
      logger.warn("==Unhandled content-ready event", event.detail);
  }
  if (DOMLoaded && metadataLoaded && mediasChecked) {
    loadPlayback();
    document.dispatchEvent(new CustomEvent('playback-ready', {'detail': 'content'}));
  }
}, false);

document.addEventListener('playback-ready', function(event) {
  logger.debug("==Playback ready", event.detail);
  switch(event.detail) {
    case 'data':
      dataReady = true;
      break;
    case 'media':
      mediaReady = true;
      break;
    case 'content':
      contentReady = true;
      break;
    default:
      logger.warn("==Unhandled playback-ready event", event.detail);
  }
  if (dataReady && mediaReady && contentReady) {
    runPopcorn();
    if (firstLoad) {
      initPopcorn();
    }
  }
}, false);
