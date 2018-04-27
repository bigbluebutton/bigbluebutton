import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import SessionStorage from '/imports/ui/services/storage/session';
import Settings from '/imports/ui/services/settings';
import { defineMessages, injectIntl } from 'react-intl';
import { notify } from '/imports/ui/services/notification';
import VideoService from '/imports/ui/components/video-provider/service';
import Media from './component';
import MediaService, { getSwapLayout } from './service';
import PresentationAreaContainer from '../presentation/container';
import ScreenshareContainer from '../screenshare/container';
import DefaultContent from '../presentation/default-content/component';

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
  componentWillMount() {
    const { willMount } = this.props;
    willMount && willMount();
  }

  componentWillReceiveProps(nextProps) {
    const {
      isScreensharing,
      intl,
    } = this.props;

    if (isScreensharing !== nextProps.isScreensharing) {
      if (nextProps.isScreensharing) {
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

export default withTracker(() => {
  const { dataSaving } = Settings;
  const { viewParticipantsWebcams, viewScreenshare } = dataSaving;

  const hidePresentation = SessionStorage.getItem('meta_html5hidepresentation') || false;

  const data = {
    children: <DefaultContent />,
  };

  if (MediaService.shouldShowWhiteboard() && !hidePresentation) {
    data.currentPresentation = MediaService.getPresentationInfo();
    data.children = <PresentationAreaContainer />;
  }

  if (MediaService.shouldShowScreenshare() && (viewScreenshare || MediaService.isUserPresenter())) {
    data.children = <ScreenshareContainer />;
  }

  const usersVideo = VideoService.getAllUsersVideo();
  if (MediaService.shouldShowOverlay() && usersVideo.length) {
    data.floatingOverlay = usersVideo.length < 2;
    data.hideOverlay = usersVideo.length === 0;
  }

  data.isScreensharing = MediaService.isVideoBroadcasting();
  data.swapLayout = getSwapLayout();
  data.disableVideo = !viewParticipantsWebcams;

  if (data.swapLayout) {
    data.floatingOverlay = true;
    data.hideOverlay = hidePresentation;
  }

  const enableVideo = Meteor.settings.public.kurento.enableVideo;
  const autoShareWebcam = SessionStorage.getItem('meta_html5autosharewebcam') || false;

  if (enableVideo && autoShareWebcam) {
    data.willMount = VideoService.joinVideo;
  }

  return data;
})(injectIntl(MediaContainer));
