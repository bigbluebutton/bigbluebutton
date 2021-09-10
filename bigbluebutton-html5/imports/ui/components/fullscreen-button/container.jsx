import React from 'react';
import FullscreenButtonComponent from './component';
import { layoutSelect, layoutDispatch } from '../layout/context';

const FullscreenButtonContainer = (props) => <FullscreenButtonComponent {...props} />;

export default (props) => {
  const isIphone = !!(navigator.userAgent.match(/iPhone/i));

  const fullscreen = layoutSelect((i) => i.fullscreen);
  const { element: currentElement, group: currentGroup } = fullscreen;
  const isFullscreen = !!currentElement;
  const layoutContextDispatch = layoutDispatch();

  return (
    <FullscreenButtonContainer
      {...props}
      {...{
        isIphone,
        isFullscreen,
        currentElement,
        currentGroup,
        layoutContextDispatch,
      }}
    />
  );
};
