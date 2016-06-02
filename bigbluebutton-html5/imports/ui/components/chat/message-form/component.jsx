import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import cx from 'classnames';
import styles from './styles';

import Button from '../../button/component';
import TextareaAutosize from 'react-autosize-textarea';

const propTypes = {
};

const defaultProps = {
};

export default class MessageForm extends Component {
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

    const message = this.state.message.trim();

    if (!message) {
      return;
    }

    this.setState({ message: '' });
    this.props.handleSendMessage(message);
  }

  render() {
    return (
      <form
        {...this.props}
        ref="form"
        className={cx(this.props.className, styles.form)}
        onSubmit={this.handleSubmit}>
        <div className={styles.actions}>
          <Button
            onClick={() => alert('Not supported yet...')}
            icon={'circle-add'}
            size={'sm'}
            circle={true}
          />
        </div>
        <TextareaAutosize
          className={styles.input}
          id="message-input"
          maxlength=""
          aria-controls={this.props.chatAreaId}
          aria-label="Message input for Channel #geral"
          autocorrect="off"
          autocomplete="off"
          spellcheck="true"
          value={this.state.message}
          onChange={this.handleMessageChange}
          onKeyUp={this.handleMessageKeyUp}
        />
        <input ref="btnSubmit" className={'sr-only'} type="submit" value="Send Message" />
      </form>
    );
  }
}

MessageForm.propTypes = propTypes;
MessageForm.defaultProps = defaultProps;
