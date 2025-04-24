import React from 'react';
import { useMutation } from '@apollo/client';
import { defineMessages } from 'react-intl';
import { SET_CAPTION_LOCALE } from '/imports/ui/core/graphql/mutations/userMutations';
import {
  setAudioCaptions,
  setUserLocaleProperty,
} from '/imports/ui/components/audio/audio-graphql/audio-captions/service';
import { AudioCaptionsTextControlsProps } from './types';
import Styled from './styles';
import AudioCaptionsTextSelector from './selector/component';

const intlMessages = defineMessages({
  captions: {
    id: 'app.audio.captions.speech.captions',
    description: 'Audio captions title',
  },
});

const AudioCaptionsTextControls = ({
  intl,
  textActive,
  captionLocale,
  speechVoices,
}: AudioCaptionsTextControlsProps) => {
  const [setCaptionLocaleMutation] = useMutation(SET_CAPTION_LOCALE);

  const setUserCaptionLocale = (captionLocale: string, provider: string) => {
    setCaptionLocaleMutation({
      variables: {
        locale: captionLocale,
        provider,
      },
    });
  };

  const currentCaptionLocale = captionLocale || '';

  const onCaptionsToggleClick = (value: boolean) => {
    if (!currentCaptionLocale && !value) {
      setUserLocaleProperty('', setUserCaptionLocale);
    }
    setAudioCaptions(value);
  };

  return (
    <Styled.CaptionsToggleContainer>
      <Styled.SwitchTitle
        sx={{ margin: 0 }}
        control={(
          <Styled.MaterialSwitch
            sx={{ marginRight: '1rem' }}
            checked={textActive}
            onChange={(_: unknown, checked: boolean) => {
              onCaptionsToggleClick(checked);
            }}
          />
        )}
        label={intl.formatMessage(intlMessages.captions)}
      />
      <AudioCaptionsTextSelector
        speechVoices={speechVoices}
        captionLocale={currentCaptionLocale}
        captionActive={textActive}
      />
    </Styled.CaptionsToggleContainer>
  );
};

export default AudioCaptionsTextControls;
