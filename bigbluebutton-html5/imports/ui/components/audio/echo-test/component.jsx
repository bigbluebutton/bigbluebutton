import React, { Component } from 'react';
import Button from '/imports/ui/components/button/component';
import { defineMessages, injectIntl } from 'react-intl';
import styles from './styles';

const intlMessages = defineMessages({
  yes: {
    id: 'app.audioModal.yes',
    description: 'Hear yourself yes',
  },
  no: {
    id: 'app.audioModal.no',
    description: 'Hear yourself no',
  },
});

class EchoTest extends Component {
  constructor(props) {
    super(props);

    this.handleYes = props.handleYes.bind(this);
    this.handleNo = props.handleNo.bind(this);
    this.joinEchoTest = props.joinEchoTest.bind(this);
    this.leaveEchoTest = props.leaveEchoTest.bind(this);
  }

  render() {
    const {
      intl,
      isConnecting,
    } = this.props;

    return (
      <span>
        <Button
          className={styles.button}
          label={intl.formatMessage(intlMessages.no)}
          icon={'thumbs_down'}
          circle
          color={'danger'}
          size={'jumbo'}
          onClick={this.handleNo}
        />
        <Button
          className={styles.button}
          label={intl.formatMessage(intlMessages.yes)}
          icon={'thumbs_up'}
          circle
          color={'success'}
          size={'jumbo'}
          onClick={this.handleYes}
        />
      </span>
    );
  }
}

export default injectIntl(EchoTest);
