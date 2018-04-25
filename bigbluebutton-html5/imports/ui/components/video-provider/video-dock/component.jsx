import React, { Component } from 'react';
import { styles } from '../styles';
import { defineMessages, injectIntl } from 'react-intl';
import { log } from '/imports/ui/services/api';
import { notify } from '/imports/ui/services/notification';
import { toast } from 'react-toastify';
import { styles as mediaStyles } from '/imports/ui/components/media/styles';
import Toast from '/imports/ui/components/toast/component';
import _ from 'lodash';

import VideoList from '../video-list/component';

const intlMessages = defineMessages({
  chromeExtensionError: {
    id: 'app.video.chromeExtensionError',
    description: 'Error message for Chrome Extension not installed',
  },
  chromeExtensionErrorLink: {
    id: 'app.video.chromeExtensionErrorLink',
    description: 'Error message for Chrome Extension not installed',
  },
});

class VideoDock extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    const { users, userId } = this.props;

    document.addEventListener('installChromeExtension', this.installChromeExtension.bind(this));
  }

  componentWillUnmount() {
    document.removeEventListener('installChromeExtension', this.installChromeExtension.bind(this));
  }

  notifyError(message) {
    notify(message, 'error', 'video');
  }

  installChromeExtension() {
    console.log(intlMessages);
    const { intl } = this.props;
    const CHROME_EXTENSION_LINK = Meteor.settings.public.kurento.chromeExtensionLink;

    this.notifyError(<div>
      {intl.formatMessage(intlMessages.chromeExtensionError)}{' '}
      <a href={CHROME_EXTENSION_LINK} target="_blank">
        {intl.formatMessage(intlMessages.chromeExtensionErrorLink)}
      </a>
    </div>);
  }

  render() {
    if (!this.props.socketOpen) {
      // TODO: return something when disconnected
      return null;
    }

    return (
      <VideoList
        users={this.props.users}
        onMount={this.props.onStart}
        onUnmount={this.props.onStop}
      />
    );
  }
}

export default injectIntl(VideoDock);
