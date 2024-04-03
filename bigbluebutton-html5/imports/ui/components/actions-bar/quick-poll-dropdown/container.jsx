import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { injectIntl } from 'react-intl';
import PollService from '/imports/ui/components/poll/service';
import QuickPollDropdown from './component';
import { useMutation } from '@apollo/client';
import { layoutDispatch } from '../../layout/context';
import { POLL_CANCEL } from '/imports/ui/components/poll/mutations';

const QuickPollDropdownContainer = (props) => {
  const layoutContextDispatch = layoutDispatch();

  const [stopPoll] = useMutation(POLL_CANCEL);

  return <QuickPollDropdown {...{ layoutContextDispatch, stopPoll, ...props }} />;
};

export default withTracker(() => ({
  activePoll: Session.get('pollInitiated') || false,
  pollTypes: PollService.pollTypes,
}))(injectIntl(QuickPollDropdownContainer));
