import Users from '/imports/api/users';
import mapUser from '/imports/ui/services/user/mapUser';
import Auth from '/imports/ui/services/auth';

const toggleFullScreen = () => {
  const element = document.documentElement;

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

    // If the page is not currently fullscreen, make fullscreen
  } else if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
    element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
};

const isModerator = () => {
  const currentUserId = Auth.userID;
  const currentUser = Users.findOne({ userId: currentUserId });

  console.error(currentUser)
  return (currentUser) ? mapUser(currentUser).isModerator : null;
};


export {
  isModerator,
  toggleFullScreen,
};
