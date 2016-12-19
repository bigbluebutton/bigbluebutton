import React, { Component, PropTypes } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { findDOMNode } from 'react-dom';
import cx from 'classnames';
import styles from './styles';

import MessageFormActions from './message-form-actions/component';
import TextareaAutosize from 'react-autosize-textarea';

const propTypes = {
};

const defaultProps = {
};

const messages = defineMessages({
  submitLabel: {
    id: 'app.chat.submitLabel',
    defaultMessage: 'Send Message',
    description: 'Chat submit button label',
  },
  inputLabel: {
    id: 'app.chat.inputLabel',
    defaultMessage: 'Message input for chat {name}',
    description: 'Chat message input label',
  },
  inputPlaceholder: {
    id: 'app.chat.inputPlaceholder',
    defaultMessage: 'Message {name}',
    description: 'Chat message input placeholder',
  },
});

class MessageForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: '',
    };

    this.handleMessageChange = this.handleMessageChange.bind(this);
    this.handleMessageKeyDown = this.handleMessageKeyDown.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleMessageKeyDown(e) {
    if (e.keyCode === 13 && !e.shiftKey) {
      e.preventDefault();

      let event = new Event('submit', {
        bubbles: true,
        cancelable: true,
      });

      this.refs.form.dispatchEvent(event);
    }
  }

  handleMessageChange(e) {
    this.setState({ message: e.target.value });
  }

  handleSubmit(e) {
    e.preventDefault();

    const { disabled } = this.props;

    if (disabled) {
      return false;
    }

    let message = this.state.message.trim();

    // Sanitize. See: http://shebang.brandonmintern.com/foolproof-html-escaping-in-javascript/

    let div = document.createElement('div');
    div.appendChild(document.createTextNode(message));
    message = div.innerHTML;

    if (message) {
      this.props.handleSendMessage(message);
    }

    this.setState({ message: '' });
  }

  render() {
    const { intl, chatTitle, chatName, disabled } = this.props;

    return (
      <form
        ref="form"
        className={cx(this.props.className, styles.form)}
        onSubmit={this.handleSubmit}>
        {
          // <MessageFormActions
          //   onClick={() => alert('Not supported yet...')}
          //   className={styles.actions}
          //   disabled={disabled}
          //   label={'More actions'}
          // />
        }
        <TextareaAutosize
          className={styles.input}
          id="message-input"
          placeholder={ intl.formatMessage(messages.inputPlaceholder, { name: chatName }) }
          aria-controls={this.props.chatAreaId}
          aria-label={ intl.formatMessage(messages.inputLabel, { name: chatTitle }) }
          autoCorrect="off"
          autoComplete="off"
          spellCheck="true"
          disabled={disabled}
          value={this.state.message}
          onChange={this.handleMessageChange}
          onKeyDown={this.handleMessageKeyDown}
        />
        <input
          ref="btnSubmit"
          className={'sr-only'}
          type="submit"
          disabled={disabled}
          value={ intl.formatMessage(messages.submitLabel) }
        />
      </form>
    );
  }
}

MessageForm.propTypes = propTypes;
MessageForm.defaultProps = defaultProps;

export default injectIntl(MessageForm);
