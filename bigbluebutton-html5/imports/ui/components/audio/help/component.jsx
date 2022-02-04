import React, { Component } from 'react';
import { injectIntl, defineMessages } from 'react-intl';
import Styled from './styles';

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
      audioErr,
    } = this.props;

    const { code, MIC_ERROR } = audioErr;

    let helpMessage = null;

    switch (code) {
      case MIC_ERROR.NO_SSL:
        helpMessage = intl.formatMessage(intlMessages.noSSL);
        break;
      case MIC_ERROR.MAC_OS_BLOCK:
        helpMessage = intl.formatMessage(intlMessages.macNotAllowed);
        break;
      case MIC_ERROR.NO_PERMISSION:
      default:
        helpMessage = intl.formatMessage(intlMessages.descriptionHelp);
        break;
    }

    return (
      <Styled.Help>
        <Styled.Text>
          { helpMessage }
        </Styled.Text>
        <Styled.EnterAudio>
          <Styled.BackButton
            label={intl.formatMessage(intlMessages.backLabel)}
            size="md"
            color="primary"
            onClick={handleBack}
            ghost
          />
        </Styled.EnterAudio>
      </Styled.Help>
    );
  }
}

export default injectIntl(Help);
