import { debounce } from 'radash';

const TALKING_INDICATOR_MUTE_INTERVAL = 500;

export const muteUser = debounce(
  { delay: TALKING_INDICATOR_MUTE_INTERVAL },
  (
    id: string,
    muted: boolean | undefined,
    isBreakout: boolean,
    isModerator: boolean,
    toggleVoice: (userId?: string | null, muted?: string | null) => void,
  ) => {
    if (!isModerator || isBreakout || muted) return null;
    toggleVoice(id);
    return null;
  },
);

export default {
  muteUser,
};
