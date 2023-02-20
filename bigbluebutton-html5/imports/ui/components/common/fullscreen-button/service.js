function getFullscreenElement(d = document) {
  if (d.fullscreenElement) return d.fullscreenElement;
  if (d.webkitFullscreenElement) return d.webkitFullscreenElement;
  if (d.mozFullScreenElement) return d.mozFullScreenElement;
  if (d.msFullscreenElement) return d.msFullscreenElement;
  return null;
}

const isFullScreen = (element, doc = document) => {
  if (getFullscreenElement(doc) && getFullscreenElement(doc) === element) {
    return true;
  }
  return false;
};

function cancelFullScreen(doc = document) {
  if (doc.exitFullscreen) {
    doc.exitFullscreen();
  } else if (doc.mozCancelFullScreen) {
    doc.mozCancelFullScreen();
  } else if (doc.webkitExitFullscreen) {
    doc.webkitExitFullscreen();
  }
}

function fullscreenRequest(element, doc = document) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  } else {
    return;
  }
  doc.activeElement.blur();
  element.focus();
}

const toggleFullScreen = (ref = null, isDetached = false, presentationWin = window) => {
  const element = ref || (isDetached ? presentationWin.document.documentElement : document.documentElement) ;
  const doc = isDetached ? presentationWin.document : document;

  if (isFullScreen(element, doc)) {
    cancelFullScreen(doc);
  } else {
    fullscreenRequest(element, doc);
  }
};

export default {
  toggleFullScreen,
  isFullScreen,
  getFullscreenElement,
};
