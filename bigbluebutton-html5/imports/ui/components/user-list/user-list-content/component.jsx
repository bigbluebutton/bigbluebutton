import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import Styled from './styles';
import UserParticipantsContainer from './user-participants/container';
import UserMessagesContainer from './user-messages/container';
import UserNotesContainer from './user-notes/container';
import UserCaptionsContainer from './user-captions/container';
import WaitingUsersContainer from './waiting-users/container';
import UserPollsContainer from './user-polls/container';
import BreakoutRoomContainer from './breakout-room/container';

const propTypes = {
  currentUser: PropTypes.shape({}).isRequired,
};

const CHAT_ENABLED = Meteor.settings.public.chat.enabled;
const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const intlMessages = defineMessages({
  usersTitle: {
    id: 'app.userList.usersTitle',
    description: 'Title for the Header',
  },
  loading: {
    id: 'app.userList.loading',
    description: 'Loading users message',
  },
});

class UserContent extends PureComponent {
  constructor() {
    super();

    this.renderEmptyUserlist = this.renderEmptyUserlist.bind(this);
  }

  renderEmptyUserlist() {
    const { intl } = this.props;

    return (
      <Styled.UserListColumn data-test="userList">
        <Styled.Container>
          <Styled.SmallTitle>
            {intl.formatMessage(intlMessages.usersTitle)}
          </Styled.SmallTitle>
        </Styled.Container>
        <Styled.LoadingUsersText>
          {intl.formatMessage(intlMessages.loading)}
        </Styled.LoadingUsersText>
      </Styled.UserListColumn>
    );
  }

  render() {
    const {
      currentUser,
      pendingUsers,
      isWaitingRoomEnabled,
      isGuestLobbyMessageEnabled,
      compact,
      isReady,
    } = this.props;

    const showWaitingRoom = (isGuestLobbyMessageEnabled && isWaitingRoomEnabled)
      || pendingUsers.length > 0;

    return (
      <Styled.Content data-test="userListContent">
        {CHAT_ENABLED ? <UserMessagesContainer /> : null}
        {currentUser.role === ROLE_MODERATOR ? <UserCaptionsContainer /> : null}
        <UserNotesContainer />
        {showWaitingRoom && currentUser.role === ROLE_MODERATOR
          ? (
            <WaitingUsersContainer {...{ pendingUsers }} />
          ) : null}
        <UserPollsContainer isPresenter={currentUser.presenter} />
        <BreakoutRoomContainer />
        { isReady ? <UserParticipantsContainer compact={compact} /> : this.renderEmptyUserlist() }
      </Styled.Content>
    );
  }
}

UserContent.propTypes = propTypes;

export default injectIntl(UserContent);
