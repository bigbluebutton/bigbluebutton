import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import injectNotify from '/imports/ui/components/toast/inject-notify/component';
import { Link } from 'react-router';
import cx from 'classnames';
import { styles } from '../../styles.scss';

const NOTIFICATION_INTERVAL = 2000;
const NOTIFICATION_LIFETIME = 4000;

const propTypes = {
  notify: PropTypes.func.isRequired,
  onOpen: PropTypes.func.isRequired,
};

class ChatPushNotification extends React.Component {
  static link(message, chatId) {
    return (
      <Link className={styles.link} to={`/users/chat/${chatId}`}>
        {message}
      </Link>
    );
  }

  constructor(props) {
    super(props);
    this.showNotify = _.debounce(this.showNotify.bind(this), NOTIFICATION_INTERVAL);

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

    return notify(ChatPushNotification.link(message, chatId), 'info', 'chat', { onOpen, autoClose: NOTIFICATION_LIFETIME }, ChatPushNotification.link(content, chatId), true);
  }

  render() {
    return null;
  }
}
ChatPushNotification.propTypes = propTypes;

export default injectNotify(ChatPushNotification);
