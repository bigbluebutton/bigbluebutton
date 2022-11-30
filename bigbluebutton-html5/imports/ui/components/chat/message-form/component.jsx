import React, { PureComponent } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { checkText } from 'smile2emoji';
import deviceInfo from '/imports/utils/deviceInfo';
import PropTypes from 'prop-types';
import _ from 'lodash';
import TypingIndicatorContainer from './typing-indicator/container';
import ClickOutside from '/imports/ui/components/click-outside/component';
import Styled from './styles';
import { escapeHtml } from '/imports/utils/string-utils';
import { isChatEnabled } from '/imports/ui/services/features';
import EmojiList from '../emoji-list/component';

const propTypes = {
  intl: PropTypes.object.isRequired,
  chatId: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
  minMessageLength: PropTypes.number.isRequired,
  maxMessageLength: PropTypes.number.isRequired,
  chatTitle: PropTypes.string.isRequired,
  chatAreaId: PropTypes.string.isRequired,
  handleSendMessage: PropTypes.func.isRequired,
  UnsentMessagesCollection: PropTypes.objectOf(Object).isRequired,
  connected: PropTypes.bool.isRequired,
  locked: PropTypes.bool.isRequired,
  partnerIsLoggedOut: PropTypes.bool.isRequired,
  stopUserTyping: PropTypes.func.isRequired,
  startUserTyping: PropTypes.func.isRequired,
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
  emojiButtonLabel: {
    id: 'app.chat.emojiButtonLabel',
    description: 'Chat message emoji picker button label',
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
const AUTO_CONVERT_EMOJI = Meteor.settings.public.chat.autoConvertEmoji;
const ENABLE_EMOJI_PICKER = Meteor.settings.public.chat.emojiPicker.enable;
const ENABLE_EMOJI_LIST = CHAT_CONFIG.emojiList;
const EMOJI_COLON_REG = /:(?<emoji_key>\S+)$/;

class MessageForm extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      message: '',
      error: null,
      hasErrors: false,
      showEmojiPicker: false,
      // Emoji list related.
      showEmojiList: false,
      emojiKey: '',
      focusedEmojiListItem: 0,
      selectedEmoji: null,
    };

    this.handleMessageChange = this.handleMessageChange.bind(this);
    this.handleMessageKeyDown = this.handleMessageKeyDown.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.setMessageHint = this.setMessageHint.bind(this);
    this.handleUserTyping = _.throttle(this.handleUserTyping.bind(this), 2000, { trailing: false });
    this.typingIndicator = CHAT_CONFIG.typingIndicator.enabled;
    this.applyEmoji = this.applyEmoji.bind(this);
    this.resetEmojiList = this.resetEmojiList.bind(this);
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

  handleClickOutside() {
    const { showEmojiPicker, showEmojiList } = this.state;
    if (showEmojiPicker) {
      this.setState({ showEmojiPicker: false });
    }
    if (showEmojiList) {
      this.setState({ showEmojiList: false });
    }
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
    const { showEmojiList, selectedEmoji } = this.state;

    // TODO Prevent send message pressing enter on mobile and/or virtual keyboard
    if (e.keyCode === 13 && !e.shiftKey) {
      e.preventDefault();

      const event = new Event('submit', {
        bubbles: true,
        cancelable: true,
      });

      if (showEmojiList) {
        this.applyEmoji(selectedEmoji);
      } else {
        this.handleSubmit(event);
      }

      return;
    }

    if (
      (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Escape')
      && showEmojiList
    ) {
      this.resetEmojiList();
    }

    if (e.key === 'ArrowUp' && showEmojiList) {
      e.preventDefault();
      this.setState(({ focusedEmojiListItem: v }) => ({ focusedEmojiListItem: v - 1 }));
    }

    if (e.key === 'ArrowDown' && showEmojiList) {
      e.preventDefault();
      this.setState(({ focusedEmojiListItem: v }) => ({ focusedEmojiListItem: v + 1 }));
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

    const { showEmojiList } = this.state;

    const cursor = this.textarea.selectionStart;

    let message = null;
    let error = null;

    if (AUTO_CONVERT_EMOJI && !ENABLE_EMOJI_LIST) {
      message = checkText(e.target.value);
    } else {
      message = e.target.value;
    }

    const chunks = [message.slice(0, cursor), message.slice(cursor)];

    if (EMOJI_COLON_REG.test(chunks[0])) {
      const emoji_key = EMOJI_COLON_REG.exec(chunks[0]).groups.emoji_key || '';

      this.setState({
        showEmojiPicker: false,
        showEmojiList: true,
        emojiKey: emoji_key.toLowerCase(),
      });
    } else if (showEmojiList) {
      this.resetEmojiList();
    }

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

  resetEmojiList(callback = () => {}) {
    this.setState({
      emojiKey: '',
      focusedEmojiListItem: 0,
      showEmojiList: false,
      selectedEmoji: null,
    }, callback);
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

    const callback = this.typingIndicator ? stopUserTyping : null;

    handleSendMessage(escapeHtml(msg));
    this.setState({ message: '', hasErrors: false, showEmojiPicker: false }, callback);
  }

  handleEmojiSelect(emojiObject) {
    const { message } = this.state;
    const cursor = this.textarea.selectionStart;

    this.setState(
      {
        message: message.slice(0, cursor)
        + emojiObject.native
        + message.slice(cursor),
      },
    );

    const newCursor = cursor + emojiObject.native.length;
    setTimeout(() => this.textarea.setSelectionRange(newCursor, newCursor), 10);
  }

  renderEmojiPicker() {
    const { showEmojiPicker } = this.state;

    if (showEmojiPicker) {
      return (
        <Styled.EmojiPickerWrapper>
          <Styled.EmojiPicker
            onEmojiSelect={(emojiObject) => this.handleEmojiSelect(emojiObject)}
            showPreview={false}
            showSkinTones={false}
          />
        </Styled.EmojiPickerWrapper>
      );
    }
    return null;
  }

  applyEmoji(emoji) {
    const { message } = this.state;
    const cursor = this.textarea.selectionStart;
    const chunks = [message.slice(0, cursor), message.slice(cursor)];
    chunks[0] = chunks[0].replace(EMOJI_COLON_REG, emoji.native);

    this.setState({ message: chunks[0] + chunks[1] });

    this.resetEmojiList(() => {
      this.textarea.focus();
      this.textarea.setSelectionRange(chunks[0].length, chunks[0].length);
    });
  }

  renderEmojiList() {
    const { showEmojiList, emojiKey, focusedEmojiListItem } = this.state;

    if (showEmojiList) {
      return (
        <EmojiList
          emojiKey={emojiKey}
          focusedEmojiListItem={focusedEmojiListItem}
          onSelect={this.applyEmoji}
          onUpdate={(emoji) => this.setState({ selectedEmoji: emoji })}
          setFocusedItem={(item) => this.setState({ focusedEmojiListItem: item })}
          onEmpty={this.resetEmojiList}
        />
      );
    }

    return null;
  }

  renderEmojiButton() {
    const { intl } = this.props;

    return (
      <Styled.EmojiButton
        onClick={() => this.setState((prevState) => ({
          showEmojiPicker: !prevState.showEmojiPicker,
          showEmojiList: !prevState.showEmojiPicker ? false : !prevState.showEmojiList,
        }))}
        icon="happy"
        color="light"
        ghost
        type="button"
        circle
        hideLabel
        label={intl.formatMessage(messages.emojiButtonLabel)}
        data-test="emojiPickerButton"
      />
    );
  }

  renderForm() {
    const {
      intl,
      chatTitle,
      title,
      disabled,
      idChatOpen,
      partnerIsLoggedOut,
    } = this.props;

    const {
      hasErrors, error, message,
    } = this.state;

    return (
      <Styled.Form
        ref={(ref) => { this.form = ref; }}
        onSubmit={this.handleSubmit}
      >
        {this.renderEmojiPicker()}
        {this.renderEmojiList()}
        <Styled.Wrapper>
          <Styled.Input
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
            onPaste={(e) => { e.stopPropagation(); }}
            onCut={(e) => { e.stopPropagation(); }}
            onCopy={(e) => { e.stopPropagation(); }}
            async
          />
          {ENABLE_EMOJI_PICKER && this.renderEmojiButton()}
          <Styled.SendButton
            hideLabel
            circle
            aria-label={intl.formatMessage(messages.submitLabel)}
            type="submit"
            disabled={disabled || partnerIsLoggedOut}
            label={intl.formatMessage(messages.submitLabel)}
            color="primary"
            icon="send"
            onClick={() => { }}
            data-test="sendMessageButton"
          />
        </Styled.Wrapper>
        <TypingIndicatorContainer {...{ idChatOpen, error }} />
      </Styled.Form>
    );
  }

  render() {
    if (!isChatEnabled()) return null;

    return ENABLE_EMOJI_PICKER || ENABLE_EMOJI_LIST ? (
      <ClickOutside
        onClick={() => this.handleClickOutside()}
      >
        {this.renderForm()}
      </ClickOutside>
    ) : this.renderForm();
  }
}

MessageForm.propTypes = propTypes;

export default injectIntl(MessageForm);
