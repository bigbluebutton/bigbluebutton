/**
 * The single mutable seam the doubles read from, and the log sink they write
 * to. A test calls resetEnvironment() to declare the world it wants, renders,
 * then asserts over `logs`.
 */
export const logs = [];

export const environment = {
  // useAudioPlayback()
  canPlayAudio: false,
  startAudio: async () => {},
  // useRoomContext()
  room: {},
  // useIsAudioConnected()
  isAudioConnected: true,
  // useStorageKey('audioModalIsOpen')
  audioModalIsOpen: false,
  // useModalRegistration()
  modal: null,
};

export function resetEnvironment(overrides = {}) {
  logs.length = 0;
  Object.assign(environment, {
    canPlayAudio: false,
    startAudio: async () => {},
    room: {},
    isAudioConnected: true,
    audioModalIsOpen: false,
    modal: makeModalRegistration(),
  }, overrides);
  return environment;
}

// Mirrors the shape useModalRegistration() returns, with the two fields the
// container reads: `isOpen` (the granted slot) and `queuedPosition` (the
// pending request). They are independent on purpose - a queued modal has
// isOpen false and queuedPosition set, which is the case the block guard is
// about.
export function makeModalRegistration({ isOpen = false, queuedPosition = null } = {}) {
  const calls = { open: 0, close: 0 };
  return {
    isOpen,
    queuedPosition,
    calls,
    open() { calls.open += 1; },
    close() { calls.close += 1; },
  };
}

export const logsFor = (logCode) => logs.filter((entry) => entry.logCode === logCode);

export const logCodes = () => logs.map((entry) => entry.logCode);
