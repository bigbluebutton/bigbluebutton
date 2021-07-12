import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Settings from '/imports/ui/services/settings';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { Session } from 'meteor/session';
import { notify } from '/imports/ui/services/notification';
import VideoService from '/imports/ui/components/video-provider/service';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { withModalMounter } from '/imports/ui/components/modal/service';
import Media from './component';
import MediaService, { getSwapLayout, shouldEnableSwapLayout } from '/imports/ui/components/media/service';
import PresentationPodsContainer from '../presentation-pod/container';
import ScreenshareContainer from '../screenshare/container';
import DefaultContent from '../presentation/default-content/component';
import ExternalVideoContainer from '../external-video-player/container';
import Storage from '../../services/storage/session';
import { withLayoutConsumer } from '/imports/ui/components/layout/context';
import Auth from '/imports/ui/services/auth';
import breakoutService from '/imports/ui/components/breakout-room/service';

const LAYOUT_CONFIG = Meteor.settings.public.layout;

const propTypes = {
  isScreensharing: PropTypes.bool.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

const intlMessages = defineMessages({
  screenshareStarted: {
    id: 'app.media.screenshare.start',
    description: 'toast to show when a screenshare has started',
  },
  screenshareEnded: {
    id: 'app.media.screenshare.end',
    description: 'toast to show when a screenshare has ended',
  },
});

class MediaContainer extends Component {
  componentDidUpdate(prevProps) {
    const {
      isScreensharing,
      intl,
    } = this.props;
    const {
      isScreensharing: wasScreenSharing,
    } = prevProps;

    if (isScreensharing !== wasScreenSharing) {
      if (!wasScreenSharing) {
        notify(intl.formatMessage(intlMessages.screenshareStarted), 'info', 'desktop');
      } else {
        notify(intl.formatMessage(intlMessages.screenshareEnded), 'info', 'desktop');
      }
    }
  }

  render() {
    return <Media {...this.props} />;
  }
}

let userWasInBreakout = false;

export default withLayoutConsumer(withModalMounter(withTracker(() => {
  const { dataSaving } = Settings;
  const { viewScreenshare } = dataSaving;
  const hidePresentation = getFromUserSettings('bbb_hide_presentation', LAYOUT_CONFIG.hidePresentation);
  const autoSwapLayout = getFromUserSettings('bbb_auto_swap_layout', LAYOUT_CONFIG.autoSwapLayout);
  const { current_presentation: hasPresentation } = MediaService.getPresentationInfo();
  const data = {
    children: <DefaultContent {...{ autoSwapLayout, hidePresentation }} />,
    audioModalIsOpen: Session.get('audioModalIsOpen'),
    isMeteorConnected: Meteor.status().connected,
  };

  if (MediaService.shouldShowWhiteboard() && !hidePresentation) {
    data.currentPresentation = MediaService.getPresentationInfo();
    data.children = <PresentationPodsContainer />;
  }

  if (MediaService.shouldShowScreenshare() && (viewScreenshare || MediaService.isUserPresenter())) {
    data.children = <ScreenshareContainer />;
  }

  const userIsInBreakout = breakoutService.getBreakoutUserIsIn(Auth.userID);
  let deviceIds = Session.get('deviceIds');

  if (!userIsInBreakout && userWasInBreakout && deviceIds && deviceIds !== '') {
    /* used when re-sharing cameras after leaving a breakout room.
    it is needed in cases where the user has more than one active camera
    so we only share the second camera after the first
    has finished loading (can't share more than one at the same time) */
    const canConnect = Session.get('canConnect');

    deviceIds = deviceIds.split(',');

    if (canConnect) {
      const deviceId = deviceIds.shift();

      Session.set('canConnect', false);
      Session.set('WebcamDeviceId', deviceId);
      Session.set('deviceIds', deviceIds.join(','));

      VideoService.joinVideo(deviceId);
    }
  } else {
    userWasInBreakout = userIsInBreakout;
  }

  const { streams: usersVideo } = VideoService.getVideoStreams();
  data.usersVideo = usersVideo;

  if (MediaService.shouldShowOverlay() && usersVideo.length) {
    data.floatingOverlay = usersVideo.length < 2;
    data.hideOverlay = usersVideo.length === 0;
  }

  data.singleWebcam = (usersVideo.length < 2);

  data.isScreensharing = MediaService.isVideoBroadcasting();
  data.swapLayout = (getSwapLayout() || !hasPresentation) && shouldEnableSwapLayout();

  if (data.swapLayout) {
    data.floatingOverlay = true;
    data.hideOverlay = true;
  }

  if (MediaService.shouldShowExternalVideo()) {
    data.children = (
      <ExternalVideoContainer
        isPresenter={MediaService.isUserPresenter()}
      />
    );
  }

  data.webcamsPlacement = Storage.getItem('webcamsPlacement');

  MediaContainer.propTypes = propTypes;
  return data;
})(injectIntl(MediaContainer))));
