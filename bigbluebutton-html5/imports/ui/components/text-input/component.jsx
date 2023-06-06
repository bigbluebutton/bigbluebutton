import React, { PureComponent } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { isMobile } from '/imports/utils/deviceInfo';
import logger from '/imports/startup/client/logger';
import ClickOutside from '/imports/ui/components/click-outside/component';
import Styled from './styles';

const EMOJI_BUTTON = Meteor.settings.public.app.enableEmojiButton;

const propTypes = {
  placeholder: PropTypes.string,
  send: PropTypes.func.isRequired,
  emojiPickerDown: PropTypes.bool,
};

const defaultProps = {
  placeholder: '',
  send: () => logger.warn({ logCode: 'text_input_send_function' }, `Missing`),
  emojiPickerDown: false,
  enableEmoji: true,
};

const messages = defineMessages({
  sendLabel: {
    id: 'app.textInput.sendLabel',
    description: 'Text input send button label',
  },
});

class TextInput extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      message: '',
      showEmojiPicker: false
    };
  }

  hasClickOutsideActions() {
    return this.emojiEnabled();
  }

  handleOnChange(e) {
    const message = e.target.value;
    this.setState({ message });
  }

  handleOnClick() {
    const { send } = this.props;
    const { message } = this.state;

    send(message);
    this.setState({
      message: '',
      showEmojiPicker: false,
    });
  }

  handleOnKeyDown(e) {
    if (e.keyCode === 13 && e.shiftKey === false) {
      e.preventDefault();
      this.handleOnClick();
    } else if (e.keyCode === 27) { //Escape key
      const { showEmojiPicker } = this.state;

      //if the emoji picker is opened, close it
      if (showEmojiPicker) {
        this.setState({ showEmojiPicker: false });
      }
    }
  }

  handleEmojiButtonClick() {
    const { showEmojiPicker } = this.state;

    if (this.textarea) this.textarea.focus();
    this.setState({ showEmojiPicker: !showEmojiPicker });
  }

  handleEmojiSelect(emojiObject) {
    const { message } = this.state;
    if (this.textarea) this.textarea.focus();
    this.setState({ message: message + emojiObject.native });
  }

  handleClickOutside() {
    if (this.emojiEnabled()) {
      const { showEmojiPicker } = this.state;
      if (showEmojiPicker) {
        this.setState({ showEmojiPicker: false });
      }
    }
  }

  emojiEnabled() {
    if (isMobile) return false;

    const { enableEmoji } = this.props;
    return enableEmoji && EMOJI_BUTTON;
  }

  renderEmojiPicker() {
    const { showEmojiPicker } = this.state;

    if (this.emojiEnabled() && showEmojiPicker) {
      return (
        <EmojiPicker
          onEmojiSelect={emojiObject => this.handleEmojiSelect(emojiObject)}
        />
      );
    }

    return null;
  }

  renderEmojiButton = () => {
    if (!this.emojiEnabled()) return null;

    return (
      <Styled.EmojiButtonWrapper
        onClick={() => this.handleEmojiButtonClick()}
      >
        <Icon
          iconName="happy"
        />
      </Styled.EmojiButtonWrapper>
    );
  }

  renderInput() {
    const {
      intl,
      maxLength,
      placeholder,
      emojiPickerDown,
    } = this.props;

    const { message } = this.state;

    return (
      <Styled.Wrapper>
        <Styled.TextArea
          emojiEnabled={this.emojiEnabled()}
          maxLength={maxLength}
          onChange={(e) => this.handleOnChange(e)}
          onKeyDown={(e) => this.handleOnKeyDown(e)}
          onPaste={(e) => { e.stopPropagation(); }}
          onCut={(e) => { e.stopPropagation(); }}
          onCopy={(e) => { e.stopPropagation(); }}
          placeholder={placeholder}
          value={message}
        />
        <Styled.TextInputButton
          circle
          color="primary"
          hideLabel
          icon="send"
          label={intl.formatMessage(messages.sendLabel)}
          onClick={() => this.handleOnClick()}
        />
      </Styled.Wrapper>
    );
  }

  render() {
    return this.hasClickOutsideActions() ? (
      <ClickOutside
        onClick={() => this.handleClickOutside()}
      >
        {this.renderInput()}
      </ClickOutside>
    ) : this.renderInput();
  }
}

TextInput.propTypes = propTypes;
TextInput.defaultProps = defaultProps;

export default injectIntl(TextInput);
