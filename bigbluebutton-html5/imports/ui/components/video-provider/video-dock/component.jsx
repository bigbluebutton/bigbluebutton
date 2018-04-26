import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { notify } from '/imports/ui/services/notification';

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

    const CHROME_DEFAULT_EXTENSION_LINK = Meteor.settings.public.kurento.chromeDefaultExtensionLink;
    const CHROME_CUSTOM_EXTENSION_LINK = Meteor.settings.public.kurento.chromeExtensionLink;

    const CHROME_EXTENSION_LINK = CHROME_CUSTOM_EXTENSION_LINK === 'LINK' ? CHROME_DEFAULT_EXTENSION_LINK : CHROME_CUSTOM_EXTENSION_LINK;

    this.notifyError(<div>
      {intl.formatMessage(intlMessages.chromeExtensionError)}{' '}
      <a href={CHROME_EXTENSION_LINK} target="_blank">
        {intl.formatMessage(intlMessages.chromeExtensionErrorLink)}
      </a>
    </div>);
  }

  render() {
    const {
      socketOpen,
      users,
      onStart,
      onStop,
    } = this.props;

    if (!socketOpen) {
      // TODO: return something when disconnected
      return null;
    }

    return (
      <VideoList
        users={users}
        onMount={onStart}
        onUnmount={onStop}
      />
    );
  }
}

export default injectIntl(VideoDock);
