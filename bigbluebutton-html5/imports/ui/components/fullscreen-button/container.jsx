import React from 'react';
import FullscreenButtonComponent from './component';
import { LayoutContextFunc } from '../layout/context';

const FullscreenButtonContainer = (props) => <FullscreenButtonComponent {...props} />;

export default (props) => {
  const isIphone = !!(navigator.userAgent.match(/iPhone/i));

  const { layoutContextSelector } = LayoutContextFunc;

  const fullscreen = layoutContextSelector.select((i) => i.fullscreen);
  const { element: currentElement, group: currentGroup } = fullscreen;
  const isFullscreen = !!currentElement;
  const layoutContextDispatch = layoutContextSelector.layoutDispatch();

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
