import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import TimerService from '/imports/ui/components/timer/service';
import Timer from './component';

const timerContainer = props => <Timer {...props} />;

export default withTracker(() => ({
  timer: TimerService.getTimer(),
}))(timerContainer);
