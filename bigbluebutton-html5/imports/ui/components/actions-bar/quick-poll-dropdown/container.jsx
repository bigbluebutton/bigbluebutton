import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { injectIntl } from 'react-intl';
import QuickPollDropdown from './component';
import { NLayoutContext } from '../../layout/context/context';
import PollService from '/imports/ui/components/poll/service';

const QuickPollDropdownContainer = (props) => {
  const newLayoutContext = useContext(NLayoutContext);
  const { newLayoutContextDispatch } = newLayoutContext;
  return <QuickPollDropdown {...{ newLayoutContextDispatch, ...props }} />;
};

export default withTracker(() => ({
  activePoll: Session.get('pollInitiated') || false,
  pollTypes: PollService.pollTypes,
}))(injectIntl(QuickPollDropdownContainer));
