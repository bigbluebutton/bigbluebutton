function getFullscreenElement() {
  if (document.fullscreenElement) return document.fullscreenElement;
  if (document.webkitFullscreenElement) return document.webkitFullscreenElement;
  if (document.mozFullScreenElement) return document.mozFullScreenElement;
  if (document.msFullscreenElement) return document.msFullscreenElement;
  return null;
}

const isFullScreen = (element) => {
  if (getFullscreenElement() && getFullscreenElement() === element) {
    return true;
  }
  return false;
};

function cancelFullScreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
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

const toggleFullScreen = (ref = null) => {
  const element = ref || document.documentElement;

  if (isFullScreen(element)) {
    cancelFullScreen();
  } else {
    fullscreenRequest(element);
  }
};

export default {
  toggleFullScreen,
  isFullScreen,
  getFullscreenElement,
};
