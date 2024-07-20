import React from 'react';
import FullscreenService from '/imports/ui/components/common/fullscreen-button/service';
import Tooltip from './component';

const TooltipContainer = (props) => (
  <Tooltip {...props} fullscreen={FullscreenService.getFullscreenElement()} />
);

export default TooltipContainer;
