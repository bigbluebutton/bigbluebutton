import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import injectNotify from '/imports/ui/components/toast/inject-notify/component';
import { Link } from 'react-router';
import { styles } from '../../styles.scss';

const ALERT_INTERVAL = 2000; // 2 seconds
const ALERT_LIFETIME = 4000; // 4 seconds

const propTypes = {
  notify: PropTypes.func.isRequired,
  onOpen: PropTypes.func.isRequired,
};

class ChatPushAlert extends React.Component {
  static link(message, chatId) {
    return (
      <Link className={styles.link} to={`/users/chat/${chatId}`}>
        {message}
      </Link>
    );
  }

  constructor(props) {
    super(props);
    this.showNotify = _.debounce(this.showNotify.bind(this), ALERT_INTERVAL);

    this.componentDidMount = this.showNotify;
    this.componentDidUpdate = this.showNotify;
  }

  showNotify() {
    const {
      notify,
      onOpen,
      chatId,
      message,
      content,
    } = this.props;

    return notify(
      ChatPushAlert.link(message, chatId),
      'info',
      'chat',
      { onOpen, autoClose: ALERT_LIFETIME },
      ChatPushAlert.link(content, chatId),
      true,
    );
  }

  render() {
    return null;
  }
}
ChatPushAlert.propTypes = propTypes;

export default injectNotify(ChatPushAlert);
