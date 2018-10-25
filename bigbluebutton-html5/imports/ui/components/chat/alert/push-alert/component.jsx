import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import injectNotify from '/imports/ui/components/toast/inject-notify/component';
import { Session } from 'meteor/session';

const ALERT_INTERVAL = 2000; // 2 seconds
const ALERT_LIFETIME = 4000; // 4 seconds

const propTypes = {
  notify: PropTypes.func.isRequired,
  onOpen: PropTypes.func.isRequired,
  chatId: PropTypes.string.isRequired,
  message: PropTypes.node.isRequired,
  content: PropTypes.node.isRequired,
};

class ChatPushAlert extends React.Component {
  static link(message, chatId) {
    return (
      <div
        role="button"
        aria-label={message}
        tabIndex={0}
        onClick={() => {
        Session.set('isUserListOpen', true);
        Session.set('isChatOpen', true);
        Session.set('idChatOpen', chatId);
      }}
      >
        { message }
      </div>
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
