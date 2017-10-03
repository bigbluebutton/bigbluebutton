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

    this.handleYes = this.handleYes.bind(this);
    this.handleNo = this.handleNo.bind(this);
  }

  render() {
    const {
      intl,
    } = this.props;

    return (
      <div className={styles.content}>
        <Button
          className={styles.audioBtn}
          label={intl.formatMessage(intlMessages.no)}
          icon={'thumbs_down'}
          circle
          size={'jumbo'}
          onClick={this.handleNo}
        />
        <Button
          className={styles.audioBtn}
          label={intl.formatMessage(intlMessages.yes)}
          icon={'thumbs_up'}
          circle
          size={'jumbo'}
          onClick={this.handleYes}
        />
      </div>
    );
  }
}

export default injectIntl(EchoTest);
