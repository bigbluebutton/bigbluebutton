import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { injectIntl } from 'react-intl';
import QuickPollDropdown from './component';
import { LayoutContextFunc } from '../../layout/context';
import PollService from '/imports/ui/components/poll/service';

const QuickPollDropdownContainer = (props) => {
  const { layoutContextSelector } = LayoutContextFunc;
  const layoutContextDispatch = layoutContextSelector.layoutDispatch();

  return <QuickPollDropdown {...{ layoutContextDispatch, ...props }} />;
};

export default withTracker(() => ({
  activePoll: Session.get('pollInitiated') || false,
  pollTypes: PollService.pollTypes,
}))(injectIntl(QuickPollDropdownContainer));
