import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { injectIntl } from 'react-intl';
import QuickPollDropdown from './component';

const QuickPollDropdownContainer = props => <QuickPollDropdown {...props} />;

export default withTracker(() => ({
  activePoll: Session.get('pollInitiated') || false,
}))(injectIntl(QuickPollDropdownContainer));
