import { debounce } from 'radash';

const TALKING_INDICATOR_MUTE_INTERVAL = 500;

export const muteUser = debounce(
  { delay: TALKING_INDICATOR_MUTE_INTERVAL },
  (
    id: string,
    muted: boolean | undefined,
    isBreakout: boolean,
    isModerator: boolean,
    toggleVoice: (userId: string, muted: boolean) => void,
  ) => {
    if (!isModerator || isBreakout || muted) return null;
    toggleVoice(id, true);
    return null;
  },
);

export default {
  muteUser,
};
