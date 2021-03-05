import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { injectIntl } from 'react-intl';
import QuickPollDropdown from './component';
import { NLayoutContext } from '../../layout/context/context';

const QuickPollDropdownContainer = (props) => {
  const newLayoutContext = useContext(NLayoutContext);
  const { newLayoutContextDispatch } = newLayoutContext;
  return <QuickPollDropdown {...{ newLayoutContextDispatch, ...props }} />;
};

export default withTracker(() => ({
  activePoll: Session.get('pollInitiated') || false,
}))(injectIntl(QuickPollDropdownContainer));
