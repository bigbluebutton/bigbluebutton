import React, { PureComponent } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Timer from './component';
import Service from './service';
import { layoutDispatch } from '/imports/ui/components/layout/context';

const TimerContainer = ({ children, ...props }) => {
  const layoutContextDispatch = layoutDispatch();
  return (
    <Timer {...{ layoutContextDispatch, ...props}}>
      {children}
    </Timer>
  );
}

export default withTracker(() => {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  return {
    isRTL,
    isActive: Service.isActive(),
    isModerator: Service.isModerator(),
    timeOffset: Service.getTimeOffset(),
    timer: Service.getTimer(),
  };
})(TimerContainer);
