import React from 'react';
import FullscreenButtonComponent from './component';
import FullscreenService from './service';

const FullscreenButtonContainer = props => <FullscreenButtonComponent {...props} />;

export default (props) => {
  const handleToggleFullScreen = ref => FullscreenService.toggleFullScreen(ref);
  const isIphone = (navigator.userAgent.match(/iPhone/i)) ? true : false;
  return (
    <FullscreenButtonContainer {...props} {...{ handleToggleFullScreen, isIphone }} />
  );
};
