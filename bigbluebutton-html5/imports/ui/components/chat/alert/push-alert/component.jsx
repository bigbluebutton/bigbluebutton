import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import injectNotify from '/imports/ui/components/toast/inject-notify/component';
import { Session } from 'meteor/session';


const propTypes = {
  notify: PropTypes.func.isRequired,
  onOpen: PropTypes.func.isRequired,
  chatId: PropTypes.string.isRequired,
  title: PropTypes.node.isRequired,
  content: PropTypes.node.isRequired,
  alertDuration: PropTypes.number.isRequired,
};

class ChatPushAlert extends PureComponent {
  static link(title, chatId) {
    let chat = chatId;

    if (chat === 'MAIN-PUBLIC-GROUP-CHAT') {
      chat = 'public';
    }

    return (
      <div
        key={chatId}
        role="button"
        aria-label={title}
        tabIndex={0}
        onClick={() => {
          Session.set('openPanel', 'chat');
          Session.set('idChatOpen', chat);
        }}
        onKeyPress={() => null}
      >
        {title}
      </div>
    );
  }

  constructor(props) {
    super(props);
    this.showNotify = this.showNotify.bind(this);

    this.componentDidMount = this.showNotify;
    this.componentDidUpdate = this.showNotify;
  }

  showNotify() {
    const {
      notify,
      onOpen,
      chatId,
      title,
      content,
      alertDuration,
    } = this.props;

    return notify(
      ChatPushAlert.link(title, chatId),
      'info',
      'chat',
      { onOpen, autoClose: alertDuration },
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
