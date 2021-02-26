import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { injectIntl } from 'react-intl';
import QuickPollDropdown from './component';
import NewLayoutContext from '../../layout/context/context';

const QuickPollDropdownContainer = (props) => {
  const { newLayoutContextState, ...rest } = props;
  return <QuickPollDropdown {...rest} />;
};

export default withTracker(() => ({
  activePoll: Session.get('pollInitiated') || false,
}))(injectIntl(NewLayoutContext.withConsumer(QuickPollDropdownContainer)));
