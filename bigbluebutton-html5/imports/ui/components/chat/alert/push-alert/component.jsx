import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import injectNotify from '/imports/ui/components/toast/inject-notify/component';
import { Session } from 'meteor/session';
import { PANELS, ACTIONS } from '../../../layout/enums';

const propTypes = {
  notify: PropTypes.func.isRequired,
  onOpen: PropTypes.func.isRequired,
  chatId: PropTypes.string.isRequired,
  title: PropTypes.node.isRequired,
  content: PropTypes.node.isRequired,
  alertDuration: PropTypes.number.isRequired,
};

class ChatPushAlert extends PureComponent {
  constructor(props) {
    super(props);
    this.showNotify = this.showNotify.bind(this);

    this.componentDidMount = this.showNotify;
    this.componentDidUpdate = this.showNotify;
    this.link = this.link.bind(this);
  }

  link(title, chatId) {
    const { newLayoutContextDispatch } = this.props;

    return (
      <div
        key={chatId}
        role="button"
        aria-label={title}
        tabIndex={0}
        onClick={() => {
          newLayoutContextDispatch({
            type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
            value: true,
          });
          newLayoutContextDispatch({
            type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
            value: PANELS.CHAT,
          });
        }}
        onKeyPress={() => null}
      >
        {title}
      </div>
    );
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
      this.link(title, chatId),
      'info',
      'chat',
      { onOpen, autoClose: alertDuration },
      this.link(content, chatId),
      true,
    );
  }

  render() {
    return null;
  }
}
ChatPushAlert.propTypes = propTypes;

export default injectNotify(ChatPushAlert);
