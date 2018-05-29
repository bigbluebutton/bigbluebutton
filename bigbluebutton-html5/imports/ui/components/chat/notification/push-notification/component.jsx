import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import injectNotify from '/imports/ui/components/toast/inject-notify/component';
import { Link } from 'react-router';
import { styles } from '../../styles.scss';

const propTypes = {
  notify: PropTypes.func.isRequired,
  onOpen: PropTypes.func.isRequired,
};

class ChatPushNotification extends React.Component {
  constructor(props) {
    super(props);
    this.showNotify = _.debounce(this.showNotify.bind(this), 1000);

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

    return notify((<Link className={styles.link} to={`/users/chat/${chatId}`}>{message}<div>{content}</div></Link>), 'info', 'chat', { onOpen });
  }

  render() {
    return null;
  }
}
ChatPushNotification.propTypes = propTypes;

export default injectNotify(ChatPushNotification);
