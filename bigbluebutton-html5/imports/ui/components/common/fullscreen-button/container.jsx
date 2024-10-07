import React from 'react';
import FullscreenButtonComponent from './component';
import { layoutSelect, layoutDispatch } from '/imports/ui/components/layout/context';
import FullscreenService from './service';

const FullscreenButtonContainer = (props) => <FullscreenButtonComponent {...props} />;

export default (props) => {
  const handleToggleFullScreen = (ref) => FullscreenService.toggleFullScreen(ref);
  const { isFullscreen } = props;

  const fullscreen = layoutSelect((i) => i.fullscreen);
  const { element: currentElement, group: currentGroup } = fullscreen;
  const layoutContextDispatch = layoutDispatch();

  return (
    <FullscreenButtonContainer
      {...props}
      {...{
        handleToggleFullScreen,
        isFullscreen,
        currentElement,
        currentGroup,
        layoutContextDispatch,
      }}
    />
  );
};
