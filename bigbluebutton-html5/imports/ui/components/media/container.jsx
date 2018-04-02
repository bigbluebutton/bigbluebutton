import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Settings from '/imports/ui/services/settings';
import Meetings from '/imports/api/meetings/';
import Auth from '/imports/ui/services/auth';
import { defineMessages, injectIntl } from 'react-intl';
import { notify } from '/imports/ui/services/notification';
import Media from './component';
import MediaService from './service';
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
  constructor(props) {
    super(props);

    const { overlay, content, defaultContent } = this.props;
    this.state = {
      overlay,
      content: this.props.current_presentation ? content : defaultContent,
    };

    this.handleToggleLayout = this.handleToggleLayout.bind(this);
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

    if (nextProps.current_presentation !== this.props.current_presentation) {
      if (nextProps.current_presentation) {
        this.setState({ content: this.props.content });
      } else {
        this.setState({ content: this.props.defaultContent });
      }
    }
  }

  handleToggleLayout() {
    const { overlay, content } = this.state;

    this.setState({ overlay: content, content: overlay });
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

  const meeting = Meetings.findOne({ meetingId: Auth.meetingID });
  const webcamOnlyModerator = meeting.usersProp.webcamsOnlyForModerator;

  data.content = <DefaultContent />;

  if (MediaService.shouldShowWhiteboard()) {
    data.content = <PresentationAreaContainer />;
  }

  if (MediaService.shouldShowScreenshare() && (viewScreenshare || MediaService.isUserPresenter())) {
    data.content = <ScreenshareContainer />;
  }

  if (MediaService.shouldShowOverlay() && viewParticipantsWebcams && !webcamOnlyModerator) {
    data.overlay = <VideoProviderContainer />;
  }

  data.isScreensharing = MediaService.isVideoBroadcasting();

  return data;
})(injectIntl(MediaContainer));
