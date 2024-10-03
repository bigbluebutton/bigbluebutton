import { useEffect } from 'react';
import { ConferenceEnum } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/conference/enums';
import { SetSpeakerLevelCommandArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/conference/types';
import { setSpeakerLevel } from '../../../audio/audio-graphql/audio-controls/input-stream-live-selector/service';

const PluginConferenceUiCommandsHandler = () => {
  const handleSetSpeakerLevel = (event: CustomEvent<SetSpeakerLevelCommandArguments>) => {
    const { level } = event.detail;
    setSpeakerLevel(level);
  };

  useEffect(() => {
    window.addEventListener(
      ConferenceEnum.SET_SPEAKER_LEVEL,
      handleSetSpeakerLevel as EventListener,
    );

    return () => {
      window.removeEventListener(
        ConferenceEnum.SET_SPEAKER_LEVEL,
        handleSetSpeakerLevel as EventListener,
      );
    };
  }, []);
  return null;
};

export default PluginConferenceUiCommandsHandler;
