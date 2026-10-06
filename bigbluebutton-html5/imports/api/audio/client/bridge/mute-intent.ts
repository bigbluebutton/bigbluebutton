// This is a simple registrar to track whether a mute action is one the client
// itself requested, as opposed to one derived from a voice state change the
// server made (e.g.: mod mute, reconnect).
const COMMAND_LIFETIME_MS = 5000;

let pendingCommand: { muted: boolean, at: number } | null = null;

export const stampMuteCommand = (muted: boolean): void => {
  pendingCommand = { muted, at: Date.now() };
};

export const consumeMuteCommand = (muted: boolean): boolean => {
  if (pendingCommand === null) return false;

  if (Date.now() - pendingCommand.at >= COMMAND_LIFETIME_MS) {
    pendingCommand = null;

    return false;
  }

  if (pendingCommand.muted !== muted) return false;

  pendingCommand = null;

  return true;
};
