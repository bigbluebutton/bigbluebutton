import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import styles from './styles.scss';
import UserListHeader from './user-list-header/component';
import UserContent from './user-list-content/component';

const propTypes = {
  openChats: PropTypes.array.isRequired,
  users: PropTypes.array.isRequired,
  compact: PropTypes.bool,
  intl: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  meeting: PropTypes.object,
  isBreakoutRoom: PropTypes.bool,
  makeCall: PropTypes.func.isRequired,
  getAvailableActions: PropTypes.func.isRequired,
  normalizeEmojiName: PropTypes.func.isRequired,
};

const defaultProps = {
  compact: false,
  isBreakoutRoom: false,
  // This one is kinda tricky, meteor takes sometime to fetch the data and passing down
  // So the first time its create, the meeting comes as null, sending an error to the client.
  meeting: {},
};

class UserList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      compact: this.props.compact,
    };

    this.handleToggleCompactView = this.handleToggleCompactView.bind(this);
  }

  handleToggleCompactView() {
    this.setState({ compact: !this.state.compact });
  }

  render() {
    return (
      <div className={styles.userList}>
        <UserListHeader
          intl={this.props.intl}
          compact={this.state.compact}
        />
        <UserContent
          intl={this.props.intl}
          openChats={this.props.openChats}
          users={this.props.users}
          compact={this.props.compact}
          currentUser={this.props.currentUser}
          isBreakoutRoom={this.props.isBreakoutRoom}
          makeCall={this.props.makeCall}
          meeting={this.props.meeting}
          getAvailableActions={this.props.getAvailableActions}
          normalizeEmojiName={this.props.normalizeEmojiName}
        />
      </div>
    );
  }
}

UserList.propTypes = propTypes;
UserList.defaultProps = defaultProps;

export default withRouter(injectIntl(UserList));
