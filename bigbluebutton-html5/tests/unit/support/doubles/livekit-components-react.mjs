// Stands in for @livekit/components-react. `startAudio` is a stable reference
// that forwards to the environment, so useCallback([startAudio]) in the hook
// under test does not see a new identity on every render.
import { environment } from '../environment.mjs';

const startAudio = (...args) => environment.startAudio(...args);

export const useAudioPlayback = () => ({ canPlayAudio: environment.canPlayAudio, startAudio });
export const useRoomContext = () => environment.room;
