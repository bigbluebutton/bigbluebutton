import React, { PureComponent } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import cx from 'classnames';
import TextareaAutosize from 'react-autosize-textarea';
import deviceInfo from '/imports/utils/deviceInfo';
import PropTypes from 'prop-types';
import _ from 'lodash';
import TypingIndicatorContainer from './typing-indicator/container';
import { styles } from './styles.scss';
import Button from '../../button/component';

const propTypes = {
  intl: PropTypes.object.isRequired,
  chatId: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
  minMessageLength: PropTypes.number.isRequired,
  maxMessageLength: PropTypes.number.isRequired,
  chatTitle: PropTypes.string.isRequired,
  className: PropTypes.string,
  chatAreaId: PropTypes.string.isRequired,
  handleSendMessage: PropTypes.func.isRequired,
  UnsentMessagesCollection: PropTypes.objectOf(Object).isRequired,
  connected: PropTypes.bool.isRequired,
  locked: PropTypes.bool.isRequired,
  partnerIsLoggedOut: PropTypes.bool.isRequired,
  stopUserTyping: PropTypes.func.isRequired,
  startUserTyping: PropTypes.func.isRequired,
};

const defaultProps = {
  className: '',
};

const messages = defineMessages({
  submitLabel: {
    id: 'app.chat.submitLabel',
    description: 'Chat submit button label',
  },
  inputLabel: {
    id: 'app.chat.inputLabel',
    description: 'Chat message input label',
  },
  inputPlaceholder: {
    id: 'app.chat.inputPlaceholder',
    description: 'Chat message input placeholder',
  },
  errorMaxMessageLength: {
    id: 'app.chat.errorMaxMessageLength',
  },
  errorServerDisconnected: {
    id: 'app.chat.disconnected',
  },
  errorChatLocked: {
    id: 'app.chat.locked',
  },
  singularTyping: {
    id: 'app.chat.singularTyping',
    description: 'used to indicate when 1 user is typing',
  },
  pluralTyping: {
    id: 'app.chat.pluralTyping',
    description: 'used to indicate when multiple user are typing',
  },
  severalPeople: {
    id: 'app.chat.severalPeople',
    description: 'displayed when 4 or more users are typing',
  },
});

const CHAT_CONFIG = Meteor.settings.public.chat;
const CHAT_ENABLED = CHAT_CONFIG.enabled;

class MessageForm extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      message: '',
      error: null,
      hasErrors: false,
    };

    this.handleMessageChange = this.handleMessageChange.bind(this);
    this.handleMessageKeyDown = this.handleMessageKeyDown.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.setMessageHint = this.setMessageHint.bind(this);
    this.handleUserTyping = _.throttle(this.handleUserTyping.bind(this), 2000, { trailing: false });
    this.typingIndicator = CHAT_CONFIG.typingIndicator.enabled;
  }

  componentDidMount() {
    const { isMobile } = deviceInfo;
    this.setMessageState();
    this.setMessageHint();

    if (!isMobile) {
      if (this.textarea) this.textarea.focus();
    }
  }

  componentDidUpdate(prevProps) {
    const {
      chatId,
      connected,
      locked,
      partnerIsLoggedOut,
    } = this.props;
    const { message } = this.state;
    const { isMobile } = deviceInfo;

    if (prevProps.chatId !== chatId && !isMobile) {
      if (this.textarea) this.textarea.focus();
    }

    if (prevProps.chatId !== chatId) {
      this.updateUnsentMessagesCollection(prevProps.chatId, message);
      this.setState(
        {
          error: null,
          hasErrors: false,
        }, this.setMessageState(),
      );
    }

    if (
      connected !== prevProps.connected
      || locked !== prevProps.locked
      || partnerIsLoggedOut !== prevProps.partnerIsLoggedOut
    ) {
      this.setMessageHint();
    }
  }

  componentWillUnmount() {
    const { chatId } = this.props;
    const { message } = this.state;
    this.updateUnsentMessagesCollection(chatId, message);
    this.setMessageState();
  }

  setMessageHint() {
    const {
      connected,
      disabled,
      intl,
      locked,
      partnerIsLoggedOut,
    } = this.props;

    let chatDisabledHint = null;

    if (disabled && !partnerIsLoggedOut) {
      if (connected) {
        if (locked) {
          chatDisabledHint = messages.errorChatLocked;
        }
      } else {
        chatDisabledHint = messages.errorServerDisconnected;
      }
    }

    this.setState({
      hasErrors: disabled,
      error: chatDisabledHint ? intl.formatMessage(chatDisabledHint) : null,
    });
  }

  setMessageState() {
    const { chatId, UnsentMessagesCollection } = this.props;
    const unsentMessageByChat = UnsentMessagesCollection.findOne({ chatId },
      { fields: { message: 1 } });
    this.setState({ message: unsentMessageByChat ? unsentMessageByChat.message : '' });
  }

  updateUnsentMessagesCollection(chatId, message) {
    const { UnsentMessagesCollection } = this.props;
    UnsentMessagesCollection.upsert(
      { chatId },
      { $set: { message } },
    );
  }

  handleMessageKeyDown(e) {
    // TODO Prevent send message pressing enter on mobile and/or virtual keyboard
    if (e.keyCode === 13 && !e.shiftKey) {
      e.preventDefault();

      const event = new Event('submit', {
        bubbles: true,
        cancelable: true,
      });

      this.form.dispatchEvent(event);
    }
  }

  handleUserTyping(error) {
    const { startUserTyping, chatId } = this.props;
    if (error || !this.typingIndicator) return;
    startUserTyping(chatId);
  }

  handleMessageChange(e) {
    const {
      intl,
      maxMessageLength,
    } = this.props;

    const message = e.target.value;
    let error = null;

    if (message.length > maxMessageLength) {
      error = intl.formatMessage(
        messages.errorMaxMessageLength,
        { 0: message.length - maxMessageLength },
      );
    }

    this.setState({
      message,
      error,
    }, this.handleUserTyping(error));
  }

  handleSubmit(e) {
    e.preventDefault();

    const {
      disabled,
      minMessageLength,
      maxMessageLength,
      handleSendMessage,
      stopUserTyping,
    } = this.props;
    const { message } = this.state;
    let msg = message.trim();

    if (msg.length < minMessageLength) return;

    if (disabled
      || msg.length > maxMessageLength) {
      this.setState({ hasErrors: true });
      return;
    }

    // Sanitize. See: http://shebang.brandonmintern.com/foolproof-html-escaping-in-javascript/

    const div = document.createElement('div');
    div.appendChild(document.createTextNode(msg));
    msg = div.innerHTML;

    const callback = this.typingIndicator ? stopUserTyping : null;

    handleSendMessage(msg);
    this.setState({ message: '', hasErrors: false }, callback);
  }

  render() {
    const {
      intl,
      chatTitle,
      title,
      disabled,
      className,
      idChatOpen,
      partnerIsLoggedOut,
    } = this.props;

    const { hasErrors, error, message } = this.state;

    return CHAT_ENABLED ? (
      <form
        ref={(ref) => { this.form = ref; }}
        className={cx(className, styles.form)}
        onSubmit={this.handleSubmit}
      >
        <div className={styles.wrapper}>
          <TextareaAutosize
            className={styles.input}
            id="message-input"
            innerRef={(ref) => { this.textarea = ref; return this.textarea; }}
            placeholder={intl.formatMessage(messages.inputPlaceholder, { 0: title })}
            aria-label={intl.formatMessage(messages.inputLabel, { 0: chatTitle })}
            aria-invalid={hasErrors ? 'true' : 'false'}
            autoCorrect="off"
            autoComplete="off"
            spellCheck="true"
            disabled={disabled || partnerIsLoggedOut}
            value={message}
            onChange={this.handleMessageChange}
            onKeyDown={this.handleMessageKeyDown}
            async
          />
          <Button
            hideLabel
            circle
            className={styles.sendButton}
            aria-label={intl.formatMessage(messages.submitLabel)}
            type="submit"
            disabled={disabled || partnerIsLoggedOut}
            label={intl.formatMessage(messages.submitLabel)}
            color="primary"
            icon="send"
            onClick={() => { }}
            data-test="sendMessageButton"
          />
        </div>
        <TypingIndicatorContainer {...{ idChatOpen, error }} />
      </form>
    ) : null;
  }
}

MessageForm.propTypes = propTypes;
MessageForm.defaultProps = defaultProps;

export default injectIntl(MessageForm);
