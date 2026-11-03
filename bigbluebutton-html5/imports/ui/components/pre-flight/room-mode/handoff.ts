import { makeVar } from '@apollo/client';
import { RoomModeChoice } from './settings';

/**
 * A pick the pre-flight could not apply because another moderator was already
 * in the room, handed to the settings window's Room modes tab: set by the
 * notice's action, taken (and cleared) by whoever opens the settings window.
 */
const roomModeHandoffVar = makeVar<RoomModeChoice | null>(null);

/**
 * Whether something that takes the hand-off is mounted (the sidebar's settings
 * button). Without it the notice offers no action: a pick handed over then
 * would open the window later, unprompted.
 */
export const roomModeHandoffTakerVar = makeVar(false);

export default roomModeHandoffVar;
