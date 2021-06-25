import React, { useContext } from 'react';
import FullscreenButtonComponent from './component';
import FullscreenService from './service';
import { NLayoutContext } from '../layout/context/context';

const FullscreenButtonContainer = props => <FullscreenButtonComponent {...props} />;

export default (props) => {
  const handleToggleFullScreen = ref => FullscreenService.toggleFullScreen(ref);
  const isIphone = (navigator.userAgent.match(/iPhone/i)) ? true : false;

  const newLayoutContext = useContext(NLayoutContext);
  const { newLayoutContextState, newLayoutContextDispatch } = newLayoutContext;
  const { layoutLoaded: layoutManagerLoaded } = newLayoutContextState;
  const { input } = newLayoutContextState;
  const { presentation } = input;

  const isFullscreen = layoutManagerLoaded === 'new' ? presentation.isFullscreen : props.isFullscreen;

  return (
    <FullscreenButtonContainer {...props} {...{
      handleToggleFullScreen,
      isIphone,
      layoutManagerLoaded,
      isFullscreen,
      newLayoutContextDispatch
    }} />
  );
};
