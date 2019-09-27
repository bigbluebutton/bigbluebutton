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
  },
  noSSL: {
    id: 'app.audioModal.help.noSSL',
    description: 'Text decription for domain not using https',
  },
  macNotAllowed: {
    id: 'app.audioModal.help.macNotAllowed',
    description: 'Text decription for mac needed to enable OS setting',
  },
});

class Help extends Component {
  render() {
    const {
      intl,
      handleBack,
      errCode,
    } = this.props;

    let helpMessage = null;

    switch (errCode) {
      case 2:
        helpMessage = intl.formatMessage(intlMessages.noSSL);
        break;
      case 3:
        helpMessage = intl.formatMessage(intlMessages.macNotAllowed);
        break;
      default:
        helpMessage = intl.formatMessage(intlMessages.descriptionHelp);
        break;
    }

    return (
      <span className={styles.help}>
        <div className={styles.text}>
          { helpMessage }
        </div>
        <div className={styles.enterAudio}>
          <Button
            className={styles.backBtn}
            label={intl.formatMessage(intlMessages.backLabel)}
            size="md"
            color="primary"
            onClick={handleBack}
            ghost
          />
        </div>
      </span>
    );
  }
}

export default injectIntl(Help);
