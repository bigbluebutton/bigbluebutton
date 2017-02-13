import LocalStorage from '/imports/ui/services/storage/local.js';

toggleFullScreen = () => {
 let element = document.documentElement;

 if (document.fullscreenEnabled
   || document.mozFullScreenEnabled
   || document.webkitFullscreenEnabled) {

   // If the page is already fullscreen, exit fullscreen
   if (document.fullscreenElement
     || document.webkitFullscreenElement
     || document.mozFullScreenElement
     || document.msFullscreenElement) {

     if (document.exitFullscreen) {
       document.exitFullscreen();
     } else if (document.mozCancelFullScreen) {
       document.mozCancelFullScreen();
     } else if (document.webkitExitFullscreen) {
       document.webkitExitFullscreen();
     }
     minimize();

   // If the page is not currently fullscreen, make fullscreen
   } else {
     if (element.requestFullscreen) {
       element.requestFullscreen();
     } else if (element.mozRequestFullScreen) {
       element.mozRequestFullScreen();
     } else if (element.webkitRequestFullscreen) {
       element.webkitRequestFullscreen();
     } else if (element.msRequestFullscreen) {
       element.msRequestFullscreen();
     }
     maximize();
   }
 }
};

maximize = () => {
  let maximizeScreen = new CustomEvent('bbb.maximizeScreen', {
    status: 'maximized' });
  window.dispatchEvent(maximizeScreen);
};

minimize = () => {
  let minimizeScreen = new CustomEvent('bbb.minimizeScreen', {
    status: 'minimized' });
  window.dispatchEvent(minimizeScreen);
};

export {
  toggleFullScreen,
};
