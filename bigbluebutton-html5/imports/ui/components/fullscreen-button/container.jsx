import React, { useContext } from 'react';
import FullscreenButtonComponent from './component';
import FullscreenService from './service';
import { NLayoutContext } from '../layout/context/context';

const FullscreenButtonContainer = (props) => <FullscreenButtonComponent {...props} />;

export default (props) => {
  const handleToggleFullScreen = (ref) => FullscreenService.toggleFullScreen(ref);
  const isIphone = !!(navigator.userAgent.match(/iPhone/i));

  const { isFullscreen: fullscreenProps } = props;
  const newLayoutContext = useContext(NLayoutContext);
  const { newLayoutContextState, newLayoutContextDispatch } = newLayoutContext;
  const { layoutLoaded: layoutManagerLoaded } = newLayoutContextState;
  const { fullscreen } = newLayoutContextState;
  const { element: currentElement, group: currentGroup } = fullscreen;
  const isFullscreen = layoutManagerLoaded === 'new' ? !!currentElement : fullscreenProps;

  return (
    <FullscreenButtonContainer
      {...props}
      {...{
        handleToggleFullScreen,
        isIphone,
        layoutManagerLoaded,
        isFullscreen,
        currentElement,
        currentGroup,
        newLayoutContextDispatch,
      }}
    />
  );
};
