import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import ScreenReaderAlert from './component';
import ScreenReaderAlertCollection from './collection';

const ScreenReaderAlertContainer = ({ ...props }) => (<ScreenReaderAlert {...{ ...props }} />);

export default withTracker(() => {
  const olderAlert = ScreenReaderAlertCollection
    .findOne({}, { sort: { insertTime: +1 } });

  return { olderAlert };
})(ScreenReaderAlertContainer);
