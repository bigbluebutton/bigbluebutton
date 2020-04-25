import React, { PureComponent } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Timer from './component';
import Service from './service';

class TimerContainer extends PureComponent {
  render() {
    return (
      <Timer {...this.props}>
        {this.props.children}
      </Timer>
    );
  }
}

export default withTracker(() => {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  return {
    isRTL,
    isActive: Service.isActive(),
    isModerator: Service.isModerator(),
    timerStatus: Service.getTimerStatus(),
  };
})(TimerContainer);
