import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from './styles';

const propTypes = {
  confirm: PropTypes.func.isRequired,
  users: PropTypes.arrayOf(PropTypes.object).isRequired,
  room: PropTypes.number.isRequired,
  onCheck: PropTypes.func,
  onUncheck: PropTypes.func,
};

const defaultProps = {
  onCheck: () => { },
  onUncheck: () => { },
};

const intlMessages = defineMessages({
  breakoutRoomLabel: {
    id: 'app.createBreakoutRoom.breakoutRoomLabel',
    description: 'breakout room label',
  },
  doneLabel: {
    id: 'app.createBreakoutRoom.doneLabel',
    description: 'done label',
  },
});

class SortUsers extends Component {
  constructor(props) {
    super(props);

    this.setUsers = this.setUsers.bind(this);
    this.renderUserItem = this.renderUserItem.bind(this);
    this.onChage = this.onChage.bind(this);
    this.renderJoinedUserItem = this.renderJoinedUserItem.bind(this);

    this.state = {
      users: [],
      joinedUsers: [],
    };
  }

  componentDidMount() {
    const { users, breakoutJoinedUsers } = this.props;

    this.setUsers(users);
    this.setJoinedUsers(breakoutJoinedUsers);
  }

  onChage(userId, room) {
    const {
      onCheck,
      onUncheck,
    } = this.props;
    return (ev) => {
      const check = ev.target.checked;
      if (check) {
        return onCheck(userId, room);
      }
      return onUncheck(userId, room);
    };
  }

  setUsers(users) {
    this.setState({ users: users.sort((a, b) => a.room - b.room) });
  }

  setJoinedUsers(users) {
    if (!users) return;
    this.setState({ joinedUsers: users.sort((a, b) => a.sequence - b.sequence) });
  }

  renderUserItem() {
    const { room } = this.props;
    const { users } = this.state;
    return users
      .map((user, idx) => (
        <Styled.SelectUserContainer id={user.userId} key={`breakout-user-${user.userId}`}>
          <Styled.Round>
            <input
              type="checkbox"
              id={`itemId${idx}`}
              defaultChecked={user.room === room}
              onChange={this.onChage(user.userId, room)}
            />
            <label htmlFor={`itemId${idx}`}>
              <input
                type="checkbox"
                id={`itemId${idx}`}
                defaultChecked={user.room === room}
                onChange={this.onChage(user.userId, room)}
              />
            </label>
          </Styled.Round>
          <Styled.TextName>
            {user.userName}
            {user.room && !(user.room === room) ? `\t[${user.room}]` : ''}
          </Styled.TextName>
        </Styled.SelectUserContainer>
      ));
  }

  renderJoinedUserItem() {
    const { joinedUsers } = this.state;
    if (!joinedUsers.length) return null;

    return joinedUsers
      .map((b) => b.joinedUsers.map((u) => ({ ...u, room: b.sequence })))
      .flat()
      .map((user) => (
        <Styled.SelectUserContainer>
          <Styled.LockIcon />
          <Styled.TextName>
            {user.name}
            {`\t[${user.room}]`}
          </Styled.TextName>
        </Styled.SelectUserContainer>
      ));
  }

  render() {
    const {
      intl,
      room,
      confirm,
    } = this.props;
    return (
      <Styled.SelectUserScreen>
        <Styled.Header>
          <Styled.Title>
            {intl.formatMessage(intlMessages.breakoutRoomLabel, { 0: room })}
          </Styled.Title>
          <Styled.ButtonAdd
            size="md"
            label={intl.formatMessage(intlMessages.doneLabel)}
            color="primary"
            onClick={confirm}
          />
        </Styled.Header>
        {this.renderUserItem()}
        {this.renderJoinedUserItem()}
      </Styled.SelectUserScreen>
    );
  }
}
SortUsers.propTypes = propTypes;
SortUsers.defaultProps = defaultProps;

export default injectIntl(SortUsers);
