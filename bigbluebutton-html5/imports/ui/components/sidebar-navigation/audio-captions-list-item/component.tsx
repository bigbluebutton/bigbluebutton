import React, { memo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { PANELS } from '/imports/ui/components/layout/enums';
import SidebarNavigationButton from '/imports/ui/components/sidebar-navigation/sidebar-navigation-button/component';
import {
  showInSidebarNavigation,
  useIsAudioTranscriptionEnabled,
} from '/imports/ui/components/audio/audio-graphql/audio-captions/service';
import { BaseSidebarButtonProps } from '../types';

const intlMessages = defineMessages({
  audioCaptionsLabel: {
    id: 'app.audio.captions.panelTitle',
    description: 'Title for the transcription and captions panel',
  },
});

const AudioCaptionsListItem: React.FC<BaseSidebarButtonProps> = ({ isOpened }) => {
  const intl = useIntl();
  const isEnabled = useIsAudioTranscriptionEnabled();
  const shouldShowInSidebarNavigation = showInSidebarNavigation();

  if (!isEnabled || !shouldShowInSidebarNavigation) return null;

  return (
    <SidebarNavigationButton
      panel={PANELS.AUDIO_CAPTIONS}
      isOpened={isOpened}
      iconName="closed_caption"
      label={intl.formatMessage(intlMessages.audioCaptionsLabel)}
      id="audio-captions-toggle-button"
      ariaDescribedBy="audioCaptions"
      dataTest="audioCaptionsSidebarButton"
    />
  );
};

export default memo(AudioCaptionsListItem);
