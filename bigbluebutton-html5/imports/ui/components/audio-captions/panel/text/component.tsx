import React from 'react';
import { useMutation } from '@apollo/client';
import { defineMessages } from 'react-intl';
import { SET_CAPTION_LOCALE } from '/imports/ui/core/graphql/mutations/userMutations';
import {
  setAudioCaptions,
  setUserLocaleProperty,
} from '/imports/ui/components/audio/audio-graphql/audio-captions/service';
import { AudioCaptionsTextControlsProps } from './types';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';
import Styled from './styles';
import AudioCaptionsTextSelector from './selector/component';

const intlMessages = defineMessages({
  captions: {
    id: 'app.audio.captions.speech.captions',
    description: 'Audio captions title',
  },
  availableCaptionsTooltip: {
    id: 'app.audio.captions.speech.captionsToggleTooltip',
    description: 'Audio captions text track selector tooltip',
  },
  noAvailableCaptions: {
    id: 'app.audio.captions.speech.noAvailableCaptions',
    description: 'Warning about no available captions at the moment',
  },
});

const AudioCaptionsTextControls = ({
  intl,
  textActive,
  captionLocale,
  availableCaptions,
}: AudioCaptionsTextControlsProps) => {
  const [setCaptionLocaleMutation] = useMutation(SET_CAPTION_LOCALE);
  const noAvailableCaption = availableCaptions.length === 0;
  const hasAvailableCaptions = availableCaptions.length > 0;

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
  const renderSubCaptionInfo = () => {
    if (noAvailableCaption) {
      return (
        <div
          data-test="noAvailableCaptions"
          style={{
            padding: '1rem 0',
          }}
        >
          {`*${intl.formatMessage(intlMessages.noAvailableCaptions)}`}
        </div>
      );
    }
    return null;
  };

  return (
    <Styled.CaptionsToggleContainer>
      <TooltipContainer
        title={intl.formatMessage(intlMessages.availableCaptionsTooltip)}
      >
        <Styled.SwitchTitle
          sx={{ margin: 0 }}
          control={(
            <Styled.MaterialSwitch
              sx={{ marginRight: '1rem' }}
              // Can't select a transcription text track while there is no user
              // with transcription enabled.
              // Transcription text tracks become available as there are users
              // transcribing on that language
              disabled={noAvailableCaption}
              checked={textActive}
              onChange={(_: unknown, checked: boolean) => {
                onCaptionsToggleClick(checked);
              }}
            />
          )}
          label={intl.formatMessage(intlMessages.captions)}
        />
      </TooltipContainer>
      {renderSubCaptionInfo()}
      {hasAvailableCaptions && (
        <AudioCaptionsTextSelector
          availableCaptions={availableCaptions}
          captionLocale={currentCaptionLocale}
          captionActive={textActive}
        />
      )}
    </Styled.CaptionsToggleContainer>
  );
};

export default AudioCaptionsTextControls;
