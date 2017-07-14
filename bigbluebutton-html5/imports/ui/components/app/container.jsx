import React, { cloneElement } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { withRouter } from 'react-router';
import { defineMessages, injectIntl } from 'react-intl';

import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/2.0/users';
import Breakouts from '/imports/api/1.1/breakouts';

import ClosedCaptionsContainer from '/imports/ui/components/closed-captions/container';

import {
  getFontSize,
  getCaptionsStatus,
} from './service';

import { withModalMounter } from '../modal/service';

import App from './component';
import NavBarContainer from '../nav-bar/container';
import ActionsBarContainer from '../actions-bar/container';
import MediaContainer from '../media/container';

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
});

const AppContainer = (props) => {
  // inject location on the navbar container
  const navbarWithLocation = cloneElement(props.navbar, { location: props.location });

  return (
    <App {...props} navbar={navbarWithLocation}>
      {props.children}
    </App>
  );
};

export default withRouter(injectIntl(withModalMounter(createContainer((
  { router, intl, baseControls }) => {
  const currentUser = Users.findOne({ userId: Auth.userID });

  if (!currentUser.approved) {
    baseControls.updateLoadingState(intl.formatMessage(intlMessages.waitingApprovalMessage));
  }

  // Check if user is kicked out of the session
  Users.find({ userId: Auth.userID }).observeChanges({
    changed(id, fields) {
      if (fields.user && fields.user.kicked) {
        Auth.clearCredentials()
          .then(() => {
            router.push('/error/403');
            baseControls.updateErrorState(
              intl.formatMessage(intlMessages.kickedMessage),
            );
          });
      }
    },
  });

    // Close the widow when the current breakout room ends
  Breakouts.find({ breakoutMeetingId: Auth.meetingID }).observeChanges({
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
