import React, { useContext } from 'react';
import FullscreenButtonComponent from './component';
import LayoutContext from '../layout/context';
import FullscreenService from './service';

const FullscreenButtonContainer = (props) => <FullscreenButtonComponent {...props} />;

export default (props) => {
  const handleToggleFullScreen = (ref) => FullscreenService.toggleFullScreen(ref);
  var { isFullscreen } = props;

  const isIphone = !!(navigator.userAgent.match(/iPhone/i));

  const layoutContext = useContext(LayoutContext);
  const { layoutContextState, layoutContextDispatch } = layoutContext;
  const { fullscreen } = layoutContextState;
  const { element: currentElement, group: currentGroup } = fullscreen;
  const {isPresentationDetached, presentationWindow } = props;
  
  if (isPresentationDetached) {
    isFullscreen = FullscreenService.isFullScreen(presentationWindow.document.documentElement);
  }
  
  return (
    <FullscreenButtonContainer
      {...props}
      {...{
        handleToggleFullScreen,
        isIphone,
        isFullscreen,
        currentElement,
        currentGroup,
        layoutContextDispatch,
        handleToggleFullScreen,
      }}
    />
  );
};
