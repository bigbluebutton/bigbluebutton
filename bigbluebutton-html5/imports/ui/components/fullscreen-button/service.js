function getFullscreenElement(pdoc) {
  const doc = pdoc ? pdoc : document;
  if (doc.fullscreenElement) return doc.fullscreenElement;
  if (doc.webkitFullscreenElement) return doc.webkitFullscreenElement;
  if (doc.mozFullScreenElement) return doc.mozFullScreenElement;
  if (doc.msFullscreenElement) return doc.msFullscreenElement;
  return null;
}

const isFullScreen = (element) => {
  //const parentWin = element.ownerDocument.defaultView; // to get element -> document -> window
  const parentDoc = element.ownerDocument;
  if (getFullscreenElement(parentDoc) && getFullscreenElement(parentDoc) === element) {
    return true;
  }
  return false;
};

function cancelFullScreen(elem) {
  const doc = elem.ownerDocument;
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
    element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  } else {
    return;
  }
  document.activeElement.blur();
  element.focus();
}

const toggleFullScreen = (ref = null) => {
  const element = ref || document.documentElement;

  if (isFullScreen(element)) {
    cancelFullScreen(element);
  } else {
    fullscreenRequest(element);
  }
};

export default {
  toggleFullScreen,
  isFullScreen,
  getFullscreenElement,
};
