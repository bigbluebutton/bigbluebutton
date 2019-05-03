import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import Auth from '/imports/ui/services/auth';
import AppContainer from '/imports/ui/components/app/container';
import ErrorScreen from '/imports/ui/components/error-screen/component';
import MeetingEnded from '/imports/ui/components/meeting-ended/component';
import LoadingScreen from '/imports/ui/components/loading-screen/component';
import Settings from '/imports/ui/services/settings';
import AudioManager from '/imports/ui/services/audio-manager';
import logger from '/imports/startup/client/logger';
import Users from '/imports/api/users';
import { Session } from 'meteor/session';
import IntlStartup from './intl';
import Meetings from '../../api/meetings';
import AppService from '/imports/ui/components/app/service';
import Breakouts from '/imports/api/breakouts';
import AudioService from '/imports/ui/components/audio/service';
import { FormattedMessage } from 'react-intl';
import { notify } from '/imports/ui/services/notification';

const HTML = document.getElementsByTagName('html')[0];

let breakoutNotified = false;

const propTypes = {
  subscriptionsReady: PropTypes.bool,
  locale: PropTypes.string,
  approved: PropTypes.bool,
  meetingHasEnded: PropTypes.bool.isRequired,
  meetingExist: PropTypes.bool,
};

const defaultProps = {
  locale: undefined,
  approved: undefined,
  meetingExist: false,
  subscriptionsReady: false,
};

const fullscreenChangedEvents = [
  'fullscreenchange',
  'webkitfullscreenchange',
  'mozfullscreenchange',
  'MSFullscreenChange',
];

class Base extends Component {
  static handleFullscreenChange() {
    if (document.fullscreenElement
      || document.webkitFullscreenElement
      || document.mozFullScreenElement
      || document.msFullscreenElement) {
      Session.set('isFullscreen', true);
    } else {
      Session.set('isFullscreen', false);
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      meetingExisted: false,
    };
    this.updateLoadingState = this.updateLoadingState.bind(this);
  }

  componentDidMount() {
    const { animations } = this.props;

    if (animations) HTML.classList.add('animationsEnabled');
    if (!animations) HTML.classList.add('animationsDisabled');

    fullscreenChangedEvents.forEach((event) => {
      document.addEventListener(event, Base.handleFullscreenChange);
    });
    Session.set('isFullscreen', false);
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      approved,
      meetingExist,
      animations,
      ejected,
      meteorIsConnected,
      subscriptionsReady,
    } = this.props;

    const {
      loading,
      meetingExisted,
    } = this.state;

    if (!prevProps.subscriptionsReady && subscriptionsReady) {
      logger.info({ logCode: 'startup_client_subscriptions_ready' }, 'Subscriptions are ready');
    }

    if (prevProps.meetingExist && !meetingExist && !meetingExisted) {
      this.setMeetingExisted(true);
    }

    // In case the meteor restart avoid error log
    if (meteorIsConnected && (prevState.meetingExisted !== meetingExisted) && meetingExisted) {
      this.setMeetingExisted(false);
    }

    // In case the meeting delayed to load
    if (!subscriptionsReady || !meetingExist) return;

    if (approved && loading && subscriptionsReady) this.updateLoadingState(false);

    if (prevProps.ejected || ejected) {
      Session.set('codeError', '403');
      Session.set('isMeetingEnded', true);
    }

    // In case the meteor restart avoid error log
    if (meteorIsConnected && (prevState.meetingExisted !== meetingExisted)) {
      this.setMeetingExisted(false);
    }

    const enabled = HTML.classList.contains('animationsEnabled');
    const disabled = HTML.classList.contains('animationsDisabled');

    if (animations && animations !== prevProps.animations) {
      if (disabled) HTML.classList.remove('animationsDisabled');
      HTML.classList.add('animationsEnabled');
    } else if (!animations && animations !== prevProps.animations) {
      if (enabled) HTML.classList.remove('animationsEnabled');
      HTML.classList.add('animationsDisabled');
    }
  }

  componentWillUnmount() {
    fullscreenChangedEvents.forEach((event) => {
      document.removeEventListener(event, Base.handleFullscreenChange);
    });
  }

  setMeetingExisted(meetingExisted) {
    this.setState({ meetingExisted });
  }

  updateLoadingState(loading = false) {
    this.setState({
      loading,
    });
  }

  renderByState() {
    const { updateLoadingState } = this;
    const stateControls = { updateLoadingState };
    const { loading } = this.state;
    const codeError = Session.get('codeError');
    const {
      ejected,
      meetingExist,
      meetingHasEnded,
      meetingIsBreakout,
      subscriptionsReady,
    } = this.props;

    if ((loading || !subscriptionsReady) && !meetingHasEnded && meetingExist) {
      return (<LoadingScreen>{loading}</LoadingScreen>);
    }

    if (ejected && ejected.ejectedReason) {
      const { ejectedReason } = ejected;
      AudioManager.exitAudio();
      return (<MeetingEnded code={ejectedReason} />);
    }

    if (meetingHasEnded && meetingIsBreakout) window.close();

    if (meetingHasEnded && !meetingIsBreakout) {
      AudioManager.exitAudio();
      return (<MeetingEnded code={codeError} />);
    }

    if (codeError && !meetingHasEnded) {
      logger.error({ logCode: 'startup_client_usercouldnotlogin_error' }, `User could not log in HTML5, hit ${codeError}`);
      return (<ErrorScreen code={codeError} />);
    }
    // this.props.annotationsHandler.stop();
    return (<AppContainer {...this.props} baseControls={stateControls} />);
  }

  render() {
    const { updateLoadingState } = this;
    const { locale, meetingExist } = this.props;
    const stateControls = { updateLoadingState };
    const { meetingExisted } = this.state;

    return (
      (!meetingExisted && !meetingExist && Auth.loggedIn)
        ? <LoadingScreen />
        : (
          <IntlStartup locale={locale} baseControls={stateControls}>
            {this.renderByState()}
          </IntlStartup>
        )
    );
  }
}

Base.propTypes = propTypes;
Base.defaultProps = defaultProps;

const BaseContainer = withTracker(() => {
  const { locale, animations } = Settings.application;
  const { credentials, loggedIn } = Auth;
  const { meetingId } = credentials;
  let breakoutRoomSubscriptionHandler;
  let meetingModeratorSubscriptionHandler;

  if (Session.get('codeError')) return {};

  const meeting = Meetings.findOne({ meetingId });
  if (meeting) {
    const { meetingEnded } = meeting;
    if (meetingEnded) Session.set('codeError', '410');
  }

  const approved = Users.findOne({ userId: Auth.userID, approved: true, guest: true });
  const ejected = Users.findOne({ userId: Auth.userID, ejected: true });
  if (Session.get('codeError')) {
    return {
      meetingHasEnded: !!meeting && meeting.meetingEnded,
      approved,
      ejected,
      meetingIsBreakout: AppService.meetingIsBreakout(),
    };
  }

  let userSubscriptionHandler;

  const User = Users.findOne({ intId: credentials.requesterUserId });

  Breakouts.find().observeChanges({
    added() {
      breakoutNotified = false;
    },
    removed() {
      if (!AudioService.isUsingAudio() && !breakoutNotified) {
        if (meeting && !meeting.meetingEnded) {
          notify(
            <FormattedMessage
              id="app.toast.breakoutRoomEnded"
              description="message when the breakout room is ended"
            />,
            'info',
            'rooms',
          );
        }
        breakoutNotified = true;
      }
    },
  });

  Meetings.find({ meetingId }).observe({
    changed: (newDocument, oldDocument) => {
      if (newDocument.recordProp) {
        if (!oldDocument.recordProp.recording && newDocument.recordProp.recording) {
          notify(
            <FormattedMessage
              id="app.notification.recordingStart"
              description="Notification for when the recording starts"
            />,
            'success',
            'record',
          );
        }

        if (oldDocument.recordProp.recording && !newDocument.recordProp.recording) {
          notify(
            <FormattedMessage
              id="app.notification.recordingStop"
              description="Notification for when the recording stops"
            />,
            'error',
            'record',
          );
        }
      }
    },
  });

  return {
    approved,
    ejected,
    locale,
    userSubscriptionHandler,
    breakoutRoomSubscriptionHandler,
    meetingModeratorSubscriptionHandler,
    animations,
    User,
    meteorIsConnected: Meteor.status().connected,
    meetingExist: !!meeting,
    meetingHasEnded: !!meeting && meeting.meetingEnded,
    meetingIsBreakout: AppService.meetingIsBreakout(),
    subscriptionsReady: Session.get('subscriptionsReady'),
    loggedIn,
  };
})(Base);

export default BaseContainer;
