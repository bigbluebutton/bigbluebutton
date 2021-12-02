import React, { useState } from 'react';
import PictureInPictureButtonComponent from './component';
import browserInfo from '/imports/utils/browserInfo';
import logger from '/imports/startup/client/logger';

const PictureInPictureButtonContainer = (props) => <PictureInPictureButtonComponent {...props} />;

export default (props) => {
  const { videoTag } = props;
  const {
    isValidSafariForPictureInPicture,
    isAnotherValidBrowserForPictureInPicture,
  } = browserInfo;

  const [isInPictureInPictureMode, setIsPictureInPictureMode] = useState(false);

  if (!(isValidSafariForPictureInPicture || isAnotherValidBrowserForPictureInPicture)) return null;
  if (!(document.pictureInPictureEnabled && videoTag)) return null;

  videoTag.addEventListener('enterpictureinpicture', () => setIsPictureInPictureMode(true));
  videoTag.addEventListener('leavepictureinpicture', () => setIsPictureInPictureMode(false));

  function togglePictureInPictureMode() {
    if (document.pictureInPictureElement && isInPictureInPictureMode) {
      setTimeout(() => {
        document.exitPictureInPicture()
          .then(() => setIsPictureInPictureMode(false))
          .catch((e) => logger.warn({
            logCode: 'picture_in_picture_action_failed',
            extraInfo: { errorMessage: e.message, errorCode: e.code },
          }, 'Could not exit picture-in-picture'));
      }, 0);
    } else {
      setTimeout(() => {
        videoTag.requestPictureInPicture()
          .then(() => setIsPictureInPictureMode(true))
          .catch((e) => logger.warn({
            logCode: 'picture_in_picture_action_failed',
            extraInfo: { errorMessage: e.message, errorCode: e.code },
          }, 'Could not start picture-in-picture'));
      }, 0);
    }
  }

  if (isValidSafariForPictureInPicture) {
    videoTag.autoPictureInPicture = true;
  }

  const isIphone = !!(navigator.userAgent.match(/iPhone/i));

  return (
    <PictureInPictureButtonContainer
      {...props}
      {...{
        isIphone,
        togglePictureInPictureMode,
        isInPictureInPictureMode,
      }}
    />
  );
};
