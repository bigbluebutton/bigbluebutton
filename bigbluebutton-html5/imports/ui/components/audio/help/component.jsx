import React, { Component } from 'react';
import { injectIntl, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import Styled from './styles';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  isListenOnly: PropTypes.bool.isRequired,
  audioErr: PropTypes.shape({
    code: PropTypes.number,
    message: PropTypes.string,
    MIC_ERROR: PropTypes.shape({
      NO_SSL: PropTypes.number,
      MAC_OS_BLOCK: PropTypes.number,
      NO_PERMISSION: PropTypes.number,
    }),
  }).isRequired,
  handleBack: PropTypes.func.isRequired,
  troubleshootingLink: PropTypes.string,
};

const defaultProps = {
  troubleshootingLink: '',
};

const intlMessages = defineMessages({
  helpSubtitleMic: {
    id: 'app.audioModal.helpSubtitleMic',
    description: 'Text description for the audio help subtitle (microphones)',
  },
  helpSubtitleGeneric: {
    id: 'app.audioModal.helpSubtitleGeneric',
    description: 'Text description for the audio help subtitle (generic)',
  },
  helpPermissionStep1: {
    id: 'app.audioModal.helpPermissionStep1',
    description: 'Text description for the audio permission help step 1',
  },
  helpPermissionStep2: {
    id: 'app.audioModal.helpPermissionStep2',
    description: 'Text description for the audio permission help step 2',
  },
  helpPermissionStep3: {
    id: 'app.audioModal.helpPermissionStep3',
    description: 'Text description for the audio permission help step 3',
  },
  retryLabel: {
    id: 'app.audio.audioSettings.retryLabel',
    description: 'audio settings retry button label',
  },
  noSSL: {
    id: 'app.audioModal.help.noSSL',
    description: 'Text description for domain not using https',
  },
  macNotAllowed: {
    id: 'app.audioModal.help.macNotAllowed',
    description: 'Text description for mac needed to enable OS setting',
  },
  helpTroubleshoot: {
    id: 'app.audioModal.help.troubleshoot',
    description: 'Text description for help troubleshoot',
  },
  unknownError: {
    id: 'app.audioModal.help.unknownError',
    description: 'Text description for unknown error',
  },
  errorCode: {
    id: 'app.audioModal.help.errorCode',
    description: 'Text description for error code',
  },
});

class Help extends Component {
  getSubtitle() {
    const { intl, isListenOnly } = this.props;

    return !isListenOnly
      ? intl.formatMessage(intlMessages.helpSubtitleMic)
      : intl.formatMessage(intlMessages.helpSubtitleGeneric);
  }

  renderNoSSL() {
    const { intl } = this.props;

    return (
      <Styled.Text>
        {intl.formatMessage(intlMessages.noSSL)}
      </Styled.Text>
    );
  }

  renderMacNotAllowed() {
    const { intl } = this.props;

    return (
      <Styled.Text>
        {intl.formatMessage(intlMessages.macNotAllowed)}
      </Styled.Text>
    );
  }

  renderPermissionHelp() {
    const { intl } = this.props;
    return (
      <>
        <Styled.Text>
          {this.getSubtitle()}
        </Styled.Text>
        <Styled.PermissionHelpSteps>
          <li>{intl.formatMessage(intlMessages.helpPermissionStep1)}</li>
          <li>{intl.formatMessage(intlMessages.helpPermissionStep2)}</li>
          <li>{intl.formatMessage(intlMessages.helpPermissionStep3)}</li>
        </Styled.PermissionHelpSteps>
      </>
    );
  }

  renderGenericErrorHelp() {
    const { intl, audioErr } = this.props;
    const { code, message } = audioErr;

    return (
      <>
        <Styled.Text>
          {this.getSubtitle()}
        </Styled.Text>
        <Styled.Text>
          {intl.formatMessage(intlMessages.unknownError)}
        </Styled.Text>
        <Styled.UnknownError>
          {intl.formatMessage(intlMessages.errorCode, { 0: code, 1: message || 'UnknownError' })}
        </Styled.UnknownError>
      </>
    );
  }

  renderHelpMessage() {
    const { audioErr } = this.props;
    const { MIC_ERROR } = audioErr;

    switch (audioErr.code) {
      case MIC_ERROR.NO_SSL:
        return this.renderNoSSL();
      case MIC_ERROR.MAC_OS_BLOCK:
        return this.renderMacNotAllowed();
      case MIC_ERROR.NO_PERMISSION:
        return this.renderPermissionHelp();
      default:
        return this.renderGenericErrorHelp();
    }
  }

  render() {
    const {
      intl,
      handleBack,
      troubleshootingLink,
    } = this.props;

    return (
      <Styled.Help>
        {this.renderHelpMessage()}
        { troubleshootingLink && (
          <Styled.Text>
            <Styled.TroubleshootLink
              href={troubleshootingLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              {intl.formatMessage(intlMessages.helpTroubleshoot)}
            </Styled.TroubleshootLink>
          </Styled.Text>
        )}
        <Styled.EnterAudio>
          <Styled.RetryButton
            label={intl.formatMessage(intlMessages.retryLabel)}
            size="md"
            color="primary"
            onClick={handleBack}
          />
        </Styled.EnterAudio>
      </Styled.Help>
    );
  }
}

Help.propTypes = propTypes;
Help.defaultProps = defaultProps;

export default injectIntl(Help);
