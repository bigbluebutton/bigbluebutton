import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Button from '/imports/ui/components/common/button/component';
import {
  hasOnDeviceSupport,
  installOnDeviceLanguage,
  isProcessLocally,
  useOnDeviceLanguageStatus,
} from '../speech/service';
import { isWebSpeechApi } from '../service';
import Styled from './styles';

const intlMessages = defineMessages({
  available: {
    id: 'app.audio.captions.speech.onDevice.available',
    description: 'The selected transcription language runs on the device',
  },
  downloadable: {
    id: 'app.audio.captions.speech.onDevice.downloadable',
    description: 'The selected transcription language needs its on-device data downloaded first',
  },
  download: {
    id: 'app.audio.captions.speech.onDevice.download',
    description: 'Button that downloads the on-device transcription language data',
  },
  downloading: {
    id: 'app.audio.captions.speech.onDevice.downloading',
    description: 'The on-device transcription language data is being downloaded',
  },
  failed: {
    id: 'app.audio.captions.speech.onDevice.failed',
    description: 'The on-device transcription language data could not be downloaded',
  },
  retry: {
    id: 'app.audio.captions.speech.onDevice.retry',
    description: 'Button that tries the on-device language data download again',
  },
  unavailable: {
    id: 'app.audio.captions.speech.onDevice.unavailable',
    description: 'The browser cannot transcribe the selected language on the device',
  },
  joinHint: {
    id: 'app.audio.captions.speech.onDevice.joinHint',
    description: 'Joining audio waits for the language data download, unless transcription is disabled',
  },
});

interface AudioCaptionsOnDeviceNoticeProps {
  locale: string;
  showJoinHint?: boolean;
}

// With processLocally, tells the state of the selected language on the device and lets the user
// download its language data: the transcription only starts once it is there
const AudioCaptionsOnDeviceNotice: React.FC<AudioCaptionsOnDeviceNoticeProps> = ({
  locale,
  showJoinHint = false,
}) => {
  const intl = useIntl();
  const onDevice = isWebSpeechApi() && isProcessLocally() && hasOnDeviceSupport();
  const status = useOnDeviceLanguageStatus(onDevice ? locale : '');

  if (!onDevice || !locale || !status || status === 'checking') return null;

  const joinHint = showJoinHint && <span>{intl.formatMessage(intlMessages.joinHint)}</span>;

  switch (status) {
    case 'available':
      return (
        <Styled.Notice data-test="onDeviceLanguageAvailable">
          {intl.formatMessage(intlMessages.available)}
        </Styled.Notice>
      );
    case 'downloadable':
      return (
        <Styled.Notice data-test="onDeviceLanguageDownloadable">
          <span>{intl.formatMessage(intlMessages.downloadable)}</span>
          {joinHint}
          <Button
            data-test="onDeviceLanguageDownload"
            label={intl.formatMessage(intlMessages.download)}
            size="sm"
            color="primary"
            onClick={() => installOnDeviceLanguage(locale)}
          />
        </Styled.Notice>
      );
    case 'downloading':
      return (
        <Styled.Notice data-test="onDeviceLanguageDownloading" role="status">
          <Styled.Downloading>{intl.formatMessage(intlMessages.downloading)}</Styled.Downloading>
          {joinHint}
        </Styled.Notice>
      );
    case 'failed':
      return (
        <Styled.Notice data-test="onDeviceLanguageFailed" role="alert">
          <Styled.Error>{intl.formatMessage(intlMessages.failed)}</Styled.Error>
          {joinHint}
          <Button
            data-test="onDeviceLanguageDownload"
            label={intl.formatMessage(intlMessages.retry)}
            size="sm"
            color="primary"
            onClick={() => installOnDeviceLanguage(locale)}
          />
        </Styled.Notice>
      );
    default:
      return (
        <Styled.Notice data-test="onDeviceLanguageUnavailable">
          <Styled.Error>{intl.formatMessage(intlMessages.unavailable)}</Styled.Error>
        </Styled.Notice>
      );
  }
};

export default AudioCaptionsOnDeviceNotice;
