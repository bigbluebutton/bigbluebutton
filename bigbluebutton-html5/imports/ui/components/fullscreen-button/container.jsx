import React from 'react';
import FullscreenButtonComponent from './component';
<<<<<<< HEAD
import { layoutSelect, layoutDispatch } from '../layout/context';
=======
import LayoutContext from '../layout/context';
import FullscreenService from './service';
>>>>>>> 07cfcd376a44aceb543bcb8f098cf34d73b6b8bf

const FullscreenButtonContainer = (props) => <FullscreenButtonComponent {...props} />;

export default (props) => {
  const handleToggleFullScreen = (ref) => FullscreenService.toggleFullScreen(ref);
  const { isFullscreen } = props;

  const isIphone = !!(navigator.userAgent.match(/iPhone/i));

  const fullscreen = layoutSelect((i) => i.fullscreen);
  const { element: currentElement, group: currentGroup } = fullscreen;
<<<<<<< HEAD
  const isFullscreen = !!currentElement;
  const layoutContextDispatch = layoutDispatch();
=======
>>>>>>> 07cfcd376a44aceb543bcb8f098cf34d73b6b8bf

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
      }}
    />
  );
};
