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

function fullscreenRequest(element) {
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
  document.activeElement.blur();
  element.focus();
}

const toggleFullScreen = (ref = null, isDetached = false, p) => {
  const element = isDetached ? p.document.documentElement : (ref || document.documentElement);
  if (isDetached) {
    if (isFullScreen(element, p.document)) {
      cancelFullScreen(p.document);
    } else {
      fullscreenRequest(element);
    }
  } else {
    if (isFullScreen(element)) {
      cancelFullScreen();
    } else {
      fullscreenRequest(element);
    }
  }
};

export default {
  toggleFullScreen,
  isFullScreen,
  getFullscreenElement,
};
