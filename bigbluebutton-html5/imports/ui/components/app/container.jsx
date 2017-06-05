import React, { Component, cloneElement } from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import { withRouter } from 'react-router';
import { defineMessages, injectIntl } from 'react-intl';

import {
  getFontSize,
  getCaptionsStatus,
} from './service';

import { withModalMounter } from '../modal/service';

import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import Breakouts from '/imports/api/breakouts';

import App from './component';
import NavBarContainer from '../nav-bar/container';
import ActionsBarContainer from '../actions-bar/container';
import MediaContainer from '../media/container';
import AudioModalContainer from '../audio/audio-modal/component';
import ClosedCaptionsContainer from '/imports/ui/components/closed-captions/container';

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
});

class AppContainer extends Component {
  render() {
    // inject location on the navbar container
    const navbarWithLocation = cloneElement(this.props.navbar, { location: this.props.location });

    return (
      <App {...this.props} navbar={navbarWithLocation}>
        {this.props.children}
      </App>
    );
  }
}

export default withRouter(injectIntl(withModalMounter(createContainer((
  { router, intl, mountModal, baseControls }) => {
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
    removed(old) {
      Auth.clearCredentials().then(window.close);
    },
  });

  return {
    closedCaption: getCaptionsStatus() ? <ClosedCaptionsContainer /> : null,
    fontSize: getFontSize(),
  };
}, AppContainer))));

AppContainer.defaultProps = defaultProps;
