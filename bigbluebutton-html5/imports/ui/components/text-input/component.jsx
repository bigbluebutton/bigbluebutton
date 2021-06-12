import React, { PureComponent } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import TextareaAutosize from 'react-autosize-textarea';
import PropTypes from 'prop-types';
import logger from '/imports/startup/client/logger';
import Button from '/imports/ui/components/button/component';
import { styles } from './styles.scss';

const propTypes = {
  placeholder: PropTypes.string,
  send: PropTypes.func.isRequired,
};

const defaultProps = {
  placeholder: '',
  send: () => logger.warn({ logCode: 'text_input_send_function' }, `Missing`),
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

    this.state = { message: '' };
  }

  handleOnChange(e) {
    const message = e.target.value;
    this.setState({ message });
  }

  handleOnKeyDown(e) {
    if (e.keyCode === 13 && e.shiftKey === false) {
      e.preventDefault();
      this.handleOnClick();
    }
  }

  handleOnClick() {
    const { send } = this.props;
    const { message } = this.state;

    send(message);
    this.setState({ message: '' });
  }

  render() {
    const {
      intl,
      maxLength,
      placeholder,
    } = this.props;

    const { message } = this.state;

    return (
      <div className={styles.wrapper}>
        <TextareaAutosize
          className={styles.textarea}
          maxLength={maxLength}
          onChange={(e) => this.handleOnChange(e)}
          onKeyDown={(e) => this.handleOnKeyDown(e)}
          placeholder={placeholder}
          value={message}
        />
        <Button
          circle
          className={styles.button}
          color="primary"
          hideLabel
          icon="send"
          label={intl.formatMessage(messages.sendLabel)}
          onClick={() => this.handleOnClick()}
        />
      </div>
    );
  }
}

TextInput.propTypes = propTypes;
TextInput.defaultProps = defaultProps;

export default injectIntl(TextInput);
