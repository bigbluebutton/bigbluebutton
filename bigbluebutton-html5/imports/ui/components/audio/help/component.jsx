import React, { Component } from 'react';
import { injectIntl, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import Styled from './styles';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  isListenOnly: PropTypes.bool.isRequired,
  isConnected: PropTypes.bool.isRequired,
  audioErr: PropTypes.shape({
    code: PropTypes.number,
    message: PropTypes.string,
    MIC_ERROR: PropTypes.shape({
      NO_SSL: PropTypes.number,
      MAC_OS_BLOCK: PropTypes.number,
      NO_PERMISSION: PropTypes.number,
      DEVICE_NOT_FOUND: PropTypes.number,
    }),
  }).isRequired,
  handleBack: PropTypes.func.isRequired,
  handleRetryMic: PropTypes.func.isRequired,
  handleJoinListenOnly: PropTypes.func.isRequired,
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
  helpSubtitlePermission: {
    id: 'app.audioModal.helpSubtitlePermission',
    description: 'Text description for the audio help subtitle (permission)',
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
  helpSubtitleNoDevice: {
    id: 'app.audioModal.helpSubtitleNoDevice',
    description: 'Text description for the audio help subtitle (no device)',
  },
  helpNoDeviceStep1: {
    id: 'app.audioModal.helpNoDeviceStep1',
    description: 'Text description for the audio no device help step 1',
  },
  helpNoDeviceStep2: {
    id: 'app.audioModal.helpNoDeviceStep2',
    description: 'Text description for the audio no device help step 2',
  },
  backLabel: {
    id: 'app.audio.backLabel',
    description: 'audio settings back button label',
  },
  retryMicLabel: {
    id: 'app.audio.audioSettings.retryMicLabel',
    description: 'audio settings retry button label',
  },
  listenOnlyLabel: {
    id: 'app.audioModal.listenOnlyLabel',
    description: 'audio settings listen only button label',
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
    const { audioErr, intl, isListenOnly } = this.props;
    const { MIC_ERROR } = audioErr;

    switch (audioErr.code) {
      case MIC_ERROR.NO_PERMISSION:
        return intl.formatMessage(intlMessages.helpSubtitlePermission);
      case MIC_ERROR.DEVICE_NOT_FOUND:
        return intl.formatMessage(intlMessages.helpSubtitleNoDevice);
      default:
        return !isListenOnly
          ? intl.formatMessage(intlMessages.helpSubtitleMic)
          : intl.formatMessage(intlMessages.helpSubtitleGeneric);
    }
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
        <Styled.Subtitle>
          {this.getSubtitle()}
        </Styled.Subtitle>
        <Styled.HelpItems>
          <li>{intl.formatMessage(intlMessages.helpPermissionStep1)}</li>
          <li>{intl.formatMessage(intlMessages.helpPermissionStep2)}</li>
          <li>{intl.formatMessage(intlMessages.helpPermissionStep3)}</li>
        </Styled.HelpItems>
      </>
    );
  }

  renderDeviceNotFound() {
    const { intl } = this.props;

    return (
      <>
        <Styled.Subtitle>
          {this.getSubtitle()}
        </Styled.Subtitle>
        <Styled.HelpItems>
          <li>{intl.formatMessage(intlMessages.helpNoDeviceStep1)}</li>
          <li>{intl.formatMessage(intlMessages.helpNoDeviceStep2)}</li>
        </Styled.HelpItems>
      </>
    );
  }

  renderGenericErrorHelp() {
    const { intl, audioErr } = this.props;
    const { code, message } = audioErr;

    return (
      <>
        <Styled.Subtitle>
          {this.getSubtitle()}
        </Styled.Subtitle>
        <Styled.Text>
          {intl.formatMessage(intlMessages.unknownError)}
        </Styled.Text>
        <Styled.UnknownError>
          {intl.formatMessage(intlMessages.errorCode, { code, message: message || 'UnknownError' })}
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
      case MIC_ERROR.DEVICE_NOT_FOUND:
        return this.renderDeviceNotFound();
      default:
        return this.renderGenericErrorHelp();
    }
  }

  render() {
    const {
      intl,
      isConnected,
      handleBack,
      handleRetryMic,
      handleJoinListenOnly,
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
          {!isConnected ? (
            <Styled.HelpActionButton
              label={intl.formatMessage(intlMessages.listenOnlyLabel)}
              data-test="helpListenOnlyBtn"
              icon="listen"
              size="md"
              color="secondary"
              onClick={handleJoinListenOnly}
            />
          ) : (
            <Styled.HelpActionButton
              label={intl.formatMessage(intlMessages.backLabel)}
              data-test="helpBackBtn"
              color="secondary"
              size="md"
              onClick={handleBack}
            />
          )}
          <Styled.HelpActionButton
            label={intl.formatMessage(intlMessages.retryMicLabel)}
            data-test="helpRetryMicBtn"
            icon="unmute"
            size="md"
            color="primary"
            onClick={handleRetryMic}
          />
        </Styled.EnterAudio>
      </Styled.Help>
    );
  }
}

Help.propTypes = propTypes;
Help.defaultProps = defaultProps;

export default injectIntl(Help);
