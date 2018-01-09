import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import cx from 'classnames';
import TextareaAutosize from 'react-autosize-textarea';
import { styles } from './styles';
import Button from '../../button/component';

const propTypes = {
};

const defaultProps = {
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
  errorMinMessageLength: {
    id: 'app.chat.errorMinMessageLength',
  },
  errorMaxMessageLength: {
    id: 'app.chat.errorMaxMessageLength',
  },
});

class MessageForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: '',
      error: '',
      hasErrors: false,
    };

    this.handleMessageChange = this.handleMessageChange.bind(this);
    this.handleMessageKeyDown = this.handleMessageKeyDown.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.textarea.focus();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.chatName !== this.props.chatName) {
      this.textarea.focus();
    }
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

  handleMessageChange(e) {
    const { intl } = this.props;

    const message = e.target.value;
    let error = '';

    const { minMessageLength, maxMessageLength } = this.props;

    if (message.length < minMessageLength) {
      error = intl.formatMessage(messages.errorMinMessageLength,
        { 0: minMessageLength - message.length });
    }

    if (message.length > maxMessageLength) {
      error = intl.formatMessage(messages.errorMaxMessageLength,
        { 0: message.length - maxMessageLength });
    }

    this.setState({
      message,
      error,
    });
  }

  handleSubmit(e) {
    e.preventDefault();

    const { disabled, minMessageLength, maxMessageLength } = this.props;
    let message = this.state.message.trim();

    if (disabled
      || message.length === 0
      || message.length < minMessageLength
      || message.length > maxMessageLength) {
      this.setState({ hasErrors: true });
      return false;
    }

    // Sanitize. See: http://shebang.brandonmintern.com/foolproof-html-escaping-in-javascript/

    const div = document.createElement('div');
    div.appendChild(document.createTextNode(message));
    message = div.innerHTML;

    return this.props.handleSendMessage(message)
      .then(() => this.setState({
        message: '',
        hasErrors: false,
      }));
  }

  render() {
    const { intl, chatTitle, chatName, disabled,
      minMessageLength, maxMessageLength } = this.props;

    const { hasErrors, error } = this.state;

    return (
      <form
        ref={(ref) => { this.form = ref; }}
        className={cx(this.props.className, styles.form)}
        onSubmit={this.handleSubmit}
      >
        <div className={styles.wrapper}>
          <TextareaAutosize
            className={styles.input}
            id="message-input"
            innerRef={ref => (this.textarea = ref)}
            placeholder={intl.formatMessage(messages.inputPlaceholder, { 0: chatName })}
            aria-controls={this.props.chatAreaId}
            aria-label={intl.formatMessage(messages.inputLabel, { 0: chatTitle })}
            aria-invalid={hasErrors ? 'true' : 'false'}
            aria-describedby={hasErrors ? 'message-input-error' : null}
            autoCorrect="off"
            autoComplete="off"
            spellCheck="true"
            disabled={disabled}
            value={this.state.message}
            onChange={this.handleMessageChange}
            onKeyDown={this.handleMessageKeyDown}
          />
          <Button
            hideLabel
            circle
            className={styles.sendButton}
            aria-label={intl.formatMessage(messages.submitLabel)}
            type="submit"
            disabled={disabled}
            label={intl.formatMessage(messages.submitLabel)}
            color="primary"
            icon="send"
            onClick={() => null}
          />
        </div>
        <div className={styles.info}>
          { hasErrors ? <span id="message-input-error">{error}</span> : null }
        </div>
      </form>
    );
  }
}

MessageForm.propTypes = propTypes;
MessageForm.defaultProps = defaultProps;

export default injectIntl(MessageForm);
