import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import styles from '../settings/styles.scss';

class EnterAudio extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      intl,
    } = this.props;

    return (
      <div className={styles.half}>
        <Button className={styles.enterBtn}
          label={intl.formatMessage(intlMessages.enterSessionLabel)}
          size={'md'}
          color={'primary'}
          onClick={this.props.handleJoin}
        />
      </div>
    );
  }
};

const intlMessages = defineMessages({
  enterSessionLabel: {
    id: 'app.audio.enterSessionLabel',
  },
});

export default injectIntl(EnterAudio);
