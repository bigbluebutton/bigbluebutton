import { useEffect, useRef } from 'react';
import { layoutDispatch } from '/imports/ui/components/layout/context';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import { defineMessages, useIntl } from 'react-intl';
import { useIsAudioTranscriptionEnabled, useAppsGallery } from '/imports/ui/components/audio/audio-graphql/audio-captions/service';

const intlMessages = defineMessages({
  panelTitle: {
    id: 'app.audio.captions.panelTitle',
    description: 'Audio captions panel title',
  },
});

const TRANSCRIPTIONS_AND_CAPTIONS_ICON = 'closed_caption';

const AudioCaptionsPanelAppObserver = () => {
  const isEnabled = useIsAudioTranscriptionEnabled();
  const shouldUseAppsGallery = useAppsGallery();
  const layoutContextDispatch = layoutDispatch();
  const intl = useIntl();
  const audioCaptionsAppRegistered = useRef<boolean>(false);

  useEffect(() => {
    if (shouldUseAppsGallery) {
      const registerApp = (panel: string, name: string, icon: string) => {
        layoutContextDispatch({
          type: ACTIONS.REGISTER_SIDEBAR_APP,
          value: {
            panel,
            name,
            icon,
          },
        });
      };

      if (isEnabled) {
        if (!audioCaptionsAppRegistered.current) {
          registerApp(
            PANELS.AUDIO_CAPTIONS,
            intl.formatMessage(intlMessages.panelTitle),
            TRANSCRIPTIONS_AND_CAPTIONS_ICON,
          );
          audioCaptionsAppRegistered.current = true;
        }
      }
    }
  }, [isEnabled]);
  return null;
};

export default AudioCaptionsPanelAppObserver;
