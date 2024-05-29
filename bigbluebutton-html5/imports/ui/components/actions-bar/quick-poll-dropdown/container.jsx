import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { injectIntl } from 'react-intl';
import PollService from '/imports/ui/components/poll/service';
import QuickPollDropdown from './component';
import { useMutation } from '@apollo/client';
import { layoutDispatch } from '../../layout/context';
import { POLL_CANCEL } from '/imports/ui/components/poll/mutations';
import { useStorageKey } from '/imports/ui/services/storage/hooks';

const QuickPollDropdownContainer = (props) => {
  const layoutContextDispatch = layoutDispatch();
  const activePoll = useStorageKey('pollInitiated') || false;

  const [stopPoll] = useMutation(POLL_CANCEL);

  return <QuickPollDropdown {...{ layoutContextDispatch, stopPoll, activePoll, ...props }} />;
};

export default withTracker(() => ({
  pollTypes: PollService.pollTypes,
}))(injectIntl(QuickPollDropdownContainer));
