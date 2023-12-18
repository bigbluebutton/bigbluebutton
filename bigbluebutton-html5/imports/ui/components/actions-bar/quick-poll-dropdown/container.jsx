import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { injectIntl } from 'react-intl';
import { makeCall } from '/imports/ui/services/api';
import PollService from '/imports/ui/components/poll/service';
import QuickPollDropdown from './component';
import { layoutDispatch } from '../../layout/context';

const QuickPollDropdownContainer = (props) => {
  const layoutContextDispatch = layoutDispatch();
  return <QuickPollDropdown {...{ layoutContextDispatch, ...props }} />;
};

export default withTracker(() => ({
  activePoll: Session.get('pollInitiated') || false,
  pollTypes: PollService.pollTypes,
  stopPoll: () => makeCall('stopPoll'),
}))(injectIntl(QuickPollDropdownContainer));
