import React, { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Button from '/imports/ui/components/common/button/component';
import {
  hasOnDeviceSupport,
  installOnDeviceLanguage,
  isOnDeviceTranscription,
  usesCloudFallback,
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
    description: 'The selected transcription language needs its on-device language pack downloaded first',
  },
  downloading: {
    id: 'app.audio.captions.speech.onDevice.downloading',
    description: 'The on-device transcription language pack is being downloaded',
  },
  failed: {
    id: 'app.audio.captions.speech.onDevice.failed',
    description: 'The on-device transcription language pack could not be downloaded',
  },
  retry: {
    id: 'app.audio.captions.speech.onDevice.retry',
    description: 'Button that tries the on-device language pack download again',
  },
  unavailable: {
    id: 'app.audio.captions.speech.onDevice.unavailable',
    description: 'The browser cannot transcribe the selected language on the device',
  },
  cloudFallback: {
    id: 'app.audio.captions.speech.onDevice.cloudFallback',
    description: 'The selected language is transcribed by the browser speech recognition service, not on the device',
  },
});

interface AudioCaptionsOnDeviceNoticeProps {
  locale: string;
  inAudioModal?: boolean;
}

// With local or auto, tells the state of the selected language on the device. In the audio
// modal, confirming downloads its language pack. Elsewhere (the transcription panel, where there
// is nothing to confirm) turning transcription on is the confirmation, so it downloads right away.
const AudioCaptionsOnDeviceNotice: React.FC<AudioCaptionsOnDeviceNoticeProps> = ({
  locale,
  inAudioModal = false,
}) => {
  const intl = useIntl();
  const onDevice = isWebSpeechApi() && isOnDeviceTranscription() && hasOnDeviceSupport();
  const status = useOnDeviceLanguageStatus(onDevice ? locale : '');
  const cloudFallback = isWebSpeechApi() && !!locale && usesCloudFallback(locale);

  useEffect(() => {
    if (!inAudioModal && status === 'downloadable') installOnDeviceLanguage(locale);
  }, [inAudioModal, status, locale]);

  if (cloudFallback) {
    return (
      <Styled.Notice data-test="onDeviceLanguageCloudFallback">
        {intl.formatMessage(intlMessages.cloudFallback)}
      </Styled.Notice>
    );
  }

  if (!onDevice || !locale || !status || status === 'checking') return null;

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
          {intl.formatMessage(intlMessages.downloadable)}
        </Styled.Notice>
      );
    case 'downloading':
      return (
        <Styled.Notice data-test="onDeviceLanguageDownloading" role="status">
          <Styled.Downloading>{intl.formatMessage(intlMessages.downloading)}</Styled.Downloading>
        </Styled.Notice>
      );
    case 'failed':
      return (
        <Styled.Notice data-test="onDeviceLanguageFailed" role="alert">
          <Styled.Error>{intl.formatMessage(intlMessages.failed)}</Styled.Error>
          {!inAudioModal && (
            <Button
              data-test="onDeviceLanguageRetry"
              label={intl.formatMessage(intlMessages.retry)}
              size="sm"
              color="primary"
              onClick={() => installOnDeviceLanguage(locale)}
            />
          )}
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
