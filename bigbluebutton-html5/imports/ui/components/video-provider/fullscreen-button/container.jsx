import React from 'react';
import FullscreenButtonComponent from './component';
import { toggleFullScreen } from '/imports/ui/components/nav-bar/settings-dropdown/service';

const FullscreenButtonContainer = props => <FullscreenButtonComponent {...props} />;

export default (props) => {
  const handleToggleFullScreen = ref => toggleFullScreen(ref);
  return (
    <FullscreenButtonContainer {...props} {...{ handleToggleFullScreen }} />
  );
};
