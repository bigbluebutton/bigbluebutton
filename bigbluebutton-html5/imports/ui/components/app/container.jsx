import React, { cloneElement } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { withRouter } from 'react-router';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import Breakouts from '/imports/api/breakouts';
import Meetings from '/imports/api/meetings';

import ClosedCaptionsContainer from '/imports/ui/components/closed-captions/container';

import {
  getFontSize,
  getCaptionsStatus,
  meetingIsBreakout,
} from './service';

import { withModalMounter } from '../modal/service';

import App from './component';
import NavBarContainer from '../nav-bar/container';
import ActionsBarContainer from '../actions-bar/container';
import MediaContainer from '../media/container';

const propTypes = {
  navbar: PropTypes.node,
  actionsbar: PropTypes.node,
  media: PropTypes.node,
  location: PropTypes.object.isRequired,
};

const defaultProps = {
  navbar: <NavBarContainer />,
  actionsbar: <ActionsBarContainer />,
  media: <MediaContainer />,
};

const intlMessages = defineMessages({
  kickedMessage: {
    id: 'app.error.kicked',
    description: 'Message when the user is kicked out of the meeting',
  },
  waitingApprovalMessage: {
    id: 'app.guest.waiting',
    description: 'Message while a guest is waiting to be approved',
  },
  endMeetingMessage: {
    id: 'app.error.meeting.ended',
    description: 'You have logged out of the conference',
  },
});

const AppContainer = (props) => {
  // inject location on the navbar container
  const {
    navbar,
    actionsbar,
    media,
    ...otherProps
  } = props;

  const navbarWithLocation = cloneElement(navbar, { location: props.location });

  return (
    <App
      navbar={navbarWithLocation}
      actionsbar={actionsbar}
      media={media}
      {...otherProps}
    />
  );
};

export default withRouter(injectIntl(withModalMounter(createContainer(({ router, intl, baseControls }) => {
  const currentUser = Users.findOne({ userId: Auth.userID });
  const isMeetingBreakout = meetingIsBreakout();

  if (!currentUser.approved) {
    baseControls.updateLoadingState(intl.formatMessage(intlMessages.waitingApprovalMessage));
  }

  // Displayed error messages according to the mode (kicked, end meeting)
  const sendToError = (code, message) => {
    Auth.clearCredentials()
      .then(() => {
        router.push(`/error/${code}`);
        baseControls.updateErrorState(message);
      });
  };

  // Check if user is kicked out of the session
  Users.find({ userId: Auth.userID }).observeChanges({
    changed(id, fields) {
      if (fields.ejected) {
        router.push(`/ended/${403}`);
      }
    },
  });

  // forcelly logged out when the meeting is ended
  Meetings.find({ meetingId: Auth.meetingID }).observeChanges({
    removed() {
      if (isMeetingBreakout) return;
      router.push(`/ended/${410}`);
    },
  });

  // Close the widow when the current breakout room ends
  Breakouts.find({ breakoutId: Auth.meetingID }).observeChanges({
    removed() {
      Auth.clearCredentials().then(window.close);
    },
  });

  return {
    closedCaption: getCaptionsStatus() ? <ClosedCaptionsContainer /> : null,
    fontSize: getFontSize(),
  };
}, AppContainer))));

AppContainer.defaultProps = defaultProps;
AppContainer.propTypes = propTypes;
