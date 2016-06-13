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
});

class MessageForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: '',
    };

    this.handleMessageChange = this.handleMessageChange.bind(this);
    this.handleMessageKeyUp = this.handleMessageKeyUp.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleMessageKeyUp(e) {
    if (e.keyCode === 13 && !e.shiftKey) {
      this.refs.btnSubmit.click();

      // FIX: I dont know why the live bellow dont trigger the handleSubmit function
      // this.refs.form.submit();
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

    if (!message) {
      return;
    }

    this.setState({ message: '' });
    this.props.handleSendMessage(message);
  }

  render() {
    const { intl, chatTitle, disabled } = this.props;

    return (
      <form
        {...this.props}
        ref="form"
        className={cx(this.props.className, styles.form)}
        onSubmit={this.handleSubmit}>
        <MessageFormActions
          onClick={() => alert('Not supported yet...')}
          className={styles.actions}
          disabled={disabled}
        />
        <TextareaAutosize
          className={styles.input}
          id="message-input"
          maxlength=""
          aria-controls={this.props.chatAreaId}
          aria-label={ intl.formatMessage(messages.inputLabel, { name: chatTitle }) }
          autocorrect="off"
          autocomplete="off"
          spellcheck="true"
          disabled={disabled}
          value={this.state.message}
          onChange={this.handleMessageChange}
          onKeyUp={this.handleMessageKeyUp}
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
