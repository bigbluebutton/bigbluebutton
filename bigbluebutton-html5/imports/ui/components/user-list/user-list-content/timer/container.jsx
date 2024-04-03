import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import TimerService from '/imports/ui/components/timer/service';
import Timer from './component';
import { layoutSelectInput, layoutDispatch } from '../../../layout/context';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';

const TimerContainer = (props) => {
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;
  const layoutContextDispatch = layoutDispatch();
  const { data: currentUserData } = useCurrentUser((user) => ({
    isModerator: user.isModerator,
  }));

  const isModerator = currentUserData?.isModerator;
  return <Timer {...{ layoutContextDispatch, sidebarContentPanel, isModerator, ...props }} />;
};

export default withTracker(() => ({
  stopwatch: TimerService.getStopwatch(),
}))(TimerContainer);
