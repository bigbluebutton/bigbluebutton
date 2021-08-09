import React, { useContext } from 'react';
import FullscreenButtonComponent from './component';
import LayoutContext from '../layout/context';

const FullscreenButtonContainer = (props) => <FullscreenButtonComponent {...props} />;

export default (props) => {
  const isIphone = !!(navigator.userAgent.match(/iPhone/i));

  const layoutContext = useContext(LayoutContext);
  const { layoutContextState, layoutContextDispatch } = layoutContext;
  const { fullscreen } = layoutContextState;
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
        layoutContextDispatch,
      }}
    />
  );
};
