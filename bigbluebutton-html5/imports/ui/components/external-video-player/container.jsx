import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { withTracker } from 'meteor/react-meteor-data';
import ExternalVideo from './component';

const intlMessages = defineMessages({
  title: {
    id: 'app.externalVideo.title',
    description: '',
  },
});

const ExternalVideoContainer = props => (
  <ExternalVideo {...props}>
    {props.children}
  </ExternalVideo>
);

export default injectIntl(withTracker(({ params, intl }) => {
  const title = intl.formatMessage(intlMessages.title);

  return {
    title,
  };
})(ExternalVideoContainer));
