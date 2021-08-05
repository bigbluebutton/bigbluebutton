import React, { useContext } from 'react';
import FullscreenButtonComponent from './component';
import FullscreenService from './service';
import { NLayoutContext } from '../layout/context/context';

const FullscreenButtonContainer = (props) => <FullscreenButtonComponent {...props} />;

export default (props) => {
  const isIphone = !!(navigator.userAgent.match(/iPhone/i));

  const newLayoutContext = useContext(NLayoutContext);
  const { newLayoutContextState, newLayoutContextDispatch } = newLayoutContext;
  const { fullscreen } = newLayoutContextState;
  const { element: currentElement, group: currentGroup } = fullscreen;
  const isFullscreen = !!currentElement;

  return (
    <FullscreenButtonContainer
      {...props}
      {...{
        isIphone,
        isFullscreen,
        currentElement,
        currentGroup,
        newLayoutContextDispatch,
      }}
    />
  );
};
