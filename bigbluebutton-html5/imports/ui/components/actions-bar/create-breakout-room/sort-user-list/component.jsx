import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import { styles } from '../styles';

const propTypes = {
  confirm: PropTypes.func.isRequired,
  users: PropTypes.arrayOf(PropTypes.object).isRequired,
  room: PropTypes.number.isRequired,
  onCheck: PropTypes.func,
  onUncheck: PropTypes.func,
};

const defaultProps = {
  onCheck: () => {},
  onUncheck: () => {},
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

    this.state = {
      users: [],
    };
  }

  componentDidMount() {
    this.setUsers(this.props.users);
  }

  onChage(userId, room) {
    return (ev) => {
      const check = ev.target.checked;

      if (check) {
        return this.props.onCheck(userId, room);
      }
      return this.props.onUncheck(userId, room);
    };
  }

  setUsers(users) {
    this.setState({ users: users.sort((a, b) => a.room - b.room) });
  }

  renderUserItem() {
    const { room } = this.props;
    return this.state.users
      .map((user, idx) => (
        <div id={user.userId} className={styles.selectUserContainer} key={`breakout-user-${user.userId}`}>
          <span className={styles.round}>
            <input
              type="checkbox"
              id={`itemId${idx}`}
              defaultChecked={user.room === room}
              onChange={this.onChage(user.userId, room)}
            />
            <label htmlFor={`itemId${idx}`} />
          </span>
          <span className={styles.textName} >{user.userName}{user.room && !(user.room === room) ? `\t[${user.room}]` : ''}</span>
        </div>));
  }

  render() {
    const { intl } = this.props;
    return (
      <div className={styles.selectUserScreen}>
        <header className={styles.header}>
          <h2 className={styles.title}> {intl.formatMessage(intlMessages.breakoutRoomLabel, { 0: this.props.room })}</h2>
          <Button
            className={styles.buttonAdd}
            size="md"
            label={intl.formatMessage(intlMessages.doneLabel)}
            color="primary"
            onClick={this.props.confirm}
          />
        </header>
        {this.renderUserItem()}
      </div>
    );
  }
}
SortUsers.propTypes = propTypes;
SortUsers.defaultProps = defaultProps;

export default injectIntl(SortUsers);
