import React, { Component } from 'react';
import { styles } from './styles';
import { defineMessages, injectIntl } from 'react-intl';
import { log } from '/imports/ui/services/api';
import { notify } from '/imports/ui/services/notification';
import { toast } from 'react-toastify';
import { styles as mediaStyles } from '/imports/ui/components/media/styles';
import Toast from '/imports/ui/components/toast/component';
import _ from 'lodash';

import installChromeExtension from './chrome-modal';

import VideoElement from './video-element';

const intlMessages = defineMessages({
  iceCandidateError: {
    id: 'app.video.iceCandidateError',
    description: 'Error message for ice candidate fail',
  },
  permissionError: {
    id: 'app.video.permissionError',
    description: 'Error message for webcam permission',
  },
  sharingError: {
    id: 'app.video.sharingError',
    description: 'Error on sharing webcam',
  },
});

const INITIAL_SHARE_WAIT_TIME = 2000;

class VideoDock extends Component {
  constructor(props) {
    super(props);

    this.state = {
      videos: {},
      sharedWebcam: false,
      userNames: {},
    };
  }

  componentDidMount() {
    const { users, userId } = this.props;

    users.forEach((user) => {
      if (user.has_stream && user.userId !== userId) {
        // FIX: Really ugly hack, but sometimes the ICE candidates aren't
        // generated properly when we send videos right after componentDidMount
        setTimeout(() => {
          this.start(user.userId);
        }, INITIAL_SHARE_WAIT_TIME);
      }
    });

    document.addEventListener('installChromeExtension', installChromeExtension);

    window.addEventListener('resize', this.adjustVideos);
    window.addEventListener('orientationchange', this.adjustVideos);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.adjustVideos);
    window.removeEventListener('orientationchange', this.adjustVideos);
    document.removeEventListener('installChromeExtension', installChromeExtension);
  }

  adjustVideos() {
    setTimeout(() => {
      window.adjustVideos('webcamArea', true, mediaStyles.moreThan4Videos, mediaStyles.container, mediaStyles.overlayWrapper, 'presentationAreaData', 'screenshareVideo');
    }, 0);
  }

  createVideoTag(id) {
    let newState = {...this.state};
    newState.videos[id] = true;
    this.setState(newState);
  }

  destroyVideoTag(id) {
    const { videos } = this.state;

    if (id == this.props.userId) {
      this.setState({ sharedWebcam: false });
    } else {
      this.setState({
        videos: _.omit(videos, id)
      });
    }
  }

  componentDidUpdate() {
    this.adjustVideos();
  }

  start(id) {
    const { users, intl } = this.props;

    log('info', `Starting video call for video: ${id}`);

    this.createVideoTag(id);
  }

  stop(id) {
    this.destroyVideoTag(id);
    this.props.onStop(id);
  }

  // TODO: bad way of getting this
  // o(n) ... oh well
  getNameFromId(id) {
    const { users } = this.props;
    let name = undefined;

    users.forEach((user) => {
      if (user.userId === id) {
        name = user.name;
      }
    });

    return name;
  }

  render() {
    return (
      <div className={styles.videoDock}>
        <div id="webcamArea" className={styles.webcamArea}>
          {Object.keys(this.state.videos).map(id => (
            <VideoElement
              videoId={id}
              key={id}
              name={this.getNameFromId(id)}
              localCamera={false}
              onMount={this.props.onStart.bind(this)} />
          ))}
          {this.props.sharedWebcam &&
            <VideoElement
              shared={this.props.sharedWebcam}
              name={this.getNameFromId(this.props.userId)}
              videoId={this.props.userId}
              localCamera
              onMount={this.props.onStart.bind(this)} />
          }
        </div>
      </div>
    );
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { userId, sharedWebcam } = this.props;
    const currentUsers = this.props.users || {};
    const nextUsers = nextProps.users;

    const users = {};
    const present = {};

    sharedWebcam = sharedWebcam || false;

    if (sharedWebcam !== nextProps.sharedWebcam && !nextProps.sharedWebcam) {
      this.stop(userId);
    }

    if (!currentUsers) { return false; }

    // Map user objects to an object in the form {userId: has_stream}
    currentUsers.forEach((user) => {
      users[user.userId] = user.has_stream;
    });

    // Keep instances where the flag has changed or next user adds it
    nextUsers.forEach((user) => {
      const id = user.userId;
      // The case when a user exists and stream status has not changed
      if (users[id] === user.has_stream) {
        delete users[id];
      } else {
        // Case when a user has been added to the list
        users[id] = user.has_stream;
      }

      // Mark the ids which are present in nextUsers
      present[id] = true;
    });

    const userIds = Object.keys(users);

    for (let i = 0; i < userIds.length; i++) {
      const id = userIds[i];

      // If a userId is not present in nextUsers let's stop it
      if (!present[id]) {
        this.stop(id);
        continue;
      }

      console.log(`User ${users[id] ? '' : 'un'}shared webcam ${id}`);

      // If a user stream is true, changed and was shared by other
      // user we'll start it. If it is false and changed we stop it
      if (users[id]) {
        if (userId !== id) {
          this.start(id);
        }
      } else {
        this.stop(id);
      }
    }
    return true;
  }
}

export default injectIntl(VideoDock);
