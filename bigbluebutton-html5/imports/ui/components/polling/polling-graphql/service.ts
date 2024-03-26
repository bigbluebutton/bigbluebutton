import PollService from '/imports/ui/components/poll/service';
import AudioService from '/imports/ui/components/audio/service';
import { isPollingEnabled } from '/imports/ui/services/features';

const MAX_CHAR_LENGTH = 5;
const APP_CONFIG = window.meetingClientSettings.public.app;

export const shouldStackOptions = (keys: Array<string>) => keys.some((k) => k.length > MAX_CHAR_LENGTH);

const playAlert = () => AudioService.playAlertSound(
  `${APP_CONFIG.cdn + APP_CONFIG.basename + APP_CONFIG.instanceId}/resources/sounds/Poll.mp3`,
);

export default {
  shouldStackOptions,
  pollAnswerIds: PollService.pollAnswerIds,
  pollTypes: PollService.pollTypes,
  isDefaultPoll: PollService.isDefaultPoll,
  playAlert,
  isPollingEnabled,
};
