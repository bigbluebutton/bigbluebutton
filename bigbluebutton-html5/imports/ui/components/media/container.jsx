import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Settings from '/imports/ui/services/settings';
import { defineMessages, injectIntl } from 'react-intl';
import { notify } from '/imports/ui/services/notification';
import VideoService from '/imports/ui/components/video-provider/service';
import Media from './component';
import MediaService, { getSwapLayout } from './service';
import PresentationAreaContainer from '../presentation/container';
import VideoProviderContainer from '../video-provider/container';
import ScreenshareContainer from '../screenshare/container';
import DefaultContent from '../presentation/default-content/component';

const defaultProps = {
  overlay: null,
  content: <PresentationAreaContainer />,
  defaultContent: <DefaultContent />,
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
    return <Media {...this.props}>{this.props.children}</Media>;
  }
}

MediaContainer.defaultProps = defaultProps;

export default withTracker(() => {
  const { dataSaving } = Settings;
  const { viewParticipantsWebcams, viewScreenshare } = dataSaving;

  const data = {};
  data.currentPresentation = MediaService.getPresentationInfo();

  data.content = <DefaultContent />;

  if (MediaService.shouldShowWhiteboard()) {
    data.content = <PresentationAreaContainer />;
  }

  if (MediaService.shouldShowScreenshare() && (viewScreenshare || MediaService.isUserPresenter())) {
    data.content = <ScreenshareContainer />;
  }

  const usersVideo = VideoService.getAllUsersVideo();
  if (MediaService.shouldShowOverlay() && viewParticipantsWebcams) {
    data.floatingOverlay = usersVideo.length < 2;
    data.hideOverlay = usersVideo.length === 0;
    data.overlay = <VideoProviderContainer />;
  }

  data.isScreensharing = MediaService.isVideoBroadcasting();

  const shouldSwapLayout = getSwapLayout();
  if (shouldSwapLayout) {
    return {
      ...data,
      hideOverlay: false,
      floatingOverlay: true,
      overlay: data.content,
      content: data.overlay,
    };
  }

  return data;
})(injectIntl(MediaContainer));
