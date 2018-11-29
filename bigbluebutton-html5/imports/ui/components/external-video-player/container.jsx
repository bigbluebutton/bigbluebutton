import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { withTracker } from 'meteor/react-meteor-data';
import ExternalVideo from './component';
import ExternalVideoService from './service';

const intlMessages = defineMessages({
  title: {
    id: 'app.externalVideo.title',
    description: '',
  },
});

class ExternalVideoContainer extends Component {
  componentDidMount() {}
  render() {
    return (
      <ExternalVideo {...this.props}>
        {this.props.children}
      </ExternalVideo>
    );
  }
}

export default injectIntl(withTracker(({ params, intl }) => {
  const title = intl.formatMessage(intlMessages.title);

  return {
    title,
  };
})(ExternalVideoContainer));
