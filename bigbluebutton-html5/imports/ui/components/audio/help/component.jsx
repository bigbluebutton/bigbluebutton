import React, { Component } from 'react';
import Button from '/imports/ui/components/button/component';
import { injectIntl, defineMessages } from 'react-intl';
import { styles } from './styles';

const intlMessages = defineMessages({
  descriptionHelp: {
    id: 'app.audioModal.helpText',
    description: 'Text decription for the audio help',
  },
  backLabel: {
    id: 'app.audio.backLabel',
    description: 'audio settings back button label',
  }
})

class Help extends Component {
  render() {
    const {
      intl,
      handleBack,
    } = this.props;

    return (
      <span className={styles.help}>
        <div className={styles.text}>
          { intl.formatMessage(intlMessages.descriptionHelp) }
        </div>
        <div className={styles.enterAudio}>
          <Button
            className={styles.backBtn}
            label={intl.formatMessage(intlMessages.backLabel)}
            size={'md'}
            color={'primary'}
            onClick={handleBack}
            ghost
          />
        </div>
      </span>
    )
  }
};

export default injectIntl(Help);
