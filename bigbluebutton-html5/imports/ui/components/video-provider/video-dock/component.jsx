import React, { Component } from 'react';
import { styles } from '../styles';
import { defineMessages, injectIntl } from 'react-intl';
import { log } from '/imports/ui/services/api';
import { notify } from '/imports/ui/services/notification';
import { toast } from 'react-toastify';
import { styles as mediaStyles } from '/imports/ui/components/media/styles';
import Toast from '/imports/ui/components/toast/component';
import _ from 'lodash';

import VideoElement from '../video-element/component';

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

    window.addEventListener('resize', this.adjustVideos);
    window.addEventListener('orientationchange', this.adjustVideos);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.adjustVideos);
    window.removeEventListener('orientationchange', this.adjustVideos);
    document.removeEventListener('installChromeExtension', this.installChromeExtension.bind(this));
  }

  componentDidUpdate() {
    this.adjustVideos();
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

  // TODO
  // Find a better place to put this piece of code
  adjustVideos() {
    setTimeout(() => {
      window.adjustVideos('webcamArea', true, mediaStyles.moreThan4Videos, mediaStyles.container, mediaStyles.overlayWrapper, 'presentationAreaData', 'screenshareVideo');
    }, 0);
  }

  getUsersWithActiveStreams() {
    const { userId, sharedWebcam } = this.props;
    const activeFilter = (user) => {
      const isLocked = this.props.isLocked && user.locked;
      return !isLocked && (user.has_stream || (sharedWebcam && user.userId == userId));
    };

    return this.props.users.filter(activeFilter);
  }

  render() {
    if (!this.props.socketOpen) {
      // TODO: return something when disconnected
      return null;
    }

    const id = this.props.userId;
    const sharedWebcam = this.props.sharedWebcam;

    return (
      <div className={styles.videoDock} id={this.props.sharedWebcam.toString()}>
        <div id="webcamArea" className={styles.webcamArea}>
          {this.getUsersWithActiveStreams().map(user => (
            <VideoElement
              shared={id === user.userId && sharedWebcam}
              videoId={user.userId}
              key={user.userId}
              name={user.name}
              localCamera={id === user.userId}
              onShareWebcam={this.props.onShareWebcam.bind(this)}
              onMount={this.props.onStart.bind(this)}
              onUnmount={this.props.onStop.bind(this)}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default injectIntl(VideoDock);
