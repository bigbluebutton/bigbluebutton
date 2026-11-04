import PollService from '/imports/ui/components/poll/service';
import AudioService from '/imports/ui/components/audio/service';
import { assetUrl } from '/imports/ui/services/url-builder';

const MAX_CHAR_LENGTH = 5;

export const shouldStackOptions = (keys: Array<string>) => keys.some((k) => k.length > MAX_CHAR_LENGTH);

const playAlert = () => AudioService.playAlertSound(
  assetUrl('resources/sounds/Poll.mp3'),
);

export default {
  shouldStackOptions,
  pollAnswerIds: PollService.pollAnswerIds,
  pollTypes: PollService.pollTypes,
  isDefaultPoll: PollService.isDefaultPoll,
  playAlert,
};
