import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import FullscreenService from '/imports/ui/components/common/fullscreen-button/service';
import Tooltip from './component';

const TooltipContainer = props => <Tooltip {...props} />;

export default withTracker(() => ({
  fullscreen: FullscreenService.getFullscreenElement(),
}))(TooltipContainer);
