import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Styled from './styles';
import UserListParticipants from './user-participants/user-list-participants/component';
import ChatList from './user-messages/chat-list/component';
import UserNotesContainer from '../user-list-graphql/user-list-content/user-notes/component';
import TimerContainer from './timer/container';
import GuestPanelOpenerContainer from '../user-list-graphql/user-participants-title/guest-panel-opener/component';
import UserPollsContainer from './user-polls/container';
import BreakoutRoomContainer from './breakout-room/container';
import UserTitleContainer from '../user-list-graphql/user-participants-title/component';
import GenericSidekickContentNavButtonContainer from './generic-sidekick-content-button/container';
import deviceInfo from '/imports/utils/deviceInfo';

const { isMobile, isPortrait } = deviceInfo;

const propTypes = {
  currentUser: PropTypes.shape({
    role: PropTypes.string.isRequired,
    presenter: PropTypes.bool.isRequired,
  }),
  compact: PropTypes.bool,
  isTimerActive: PropTypes.bool,
};

const defaultProps = {
  currentUser: {
    role: '',
    presenter: false,
  },
  compact: false,
  isTimerActive: false,
};

class UserContent extends PureComponent {
  render() {
    const {
      currentUser,
      isTimerActive,
      compact,
    } = this.props;

    const ROLE_MODERATOR = window.meetingClientSettings.public.user.role_moderator;

    return (
      <Styled.Content data-test="userListContent">
        {isMobile || (isMobile && isPortrait) ? (
          <Styled.ScrollableList role="tabpanel" tabIndex={0}>
            <Styled.List>
              <ChatList />
              <UserNotesContainer />
              {isTimerActive
              && <TimerContainer isModerator={currentUser?.role === ROLE_MODERATOR} />}
              {currentUser?.role === ROLE_MODERATOR ? <GuestPanelOpenerContainer /> : null}
              <UserPollsContainer isPresenter={currentUser?.presenter} />
              <BreakoutRoomContainer />
              <GenericSidekickContentNavButtonContainer />
              <UserTitleContainer />
              <UserListParticipants compact={compact} />
            </Styled.List>
          </Styled.ScrollableList>
        ) : (
          <>
            <ChatList />
            <UserNotesContainer />
            {isTimerActive && <TimerContainer isModerator={currentUser?.role === ROLE_MODERATOR} />}
            {currentUser?.role === ROLE_MODERATOR ? <GuestPanelOpenerContainer /> : null}
            <UserPollsContainer isPresenter={currentUser?.presenter} />
            <BreakoutRoomContainer />
            <GenericSidekickContentNavButtonContainer />
            <UserTitleContainer />
            <UserListParticipants compact={compact} />
          </>
        )}
      </Styled.Content>
    );
  }
}

UserContent.propTypes = propTypes;
UserContent.defaultProps = defaultProps;

export default UserContent;
