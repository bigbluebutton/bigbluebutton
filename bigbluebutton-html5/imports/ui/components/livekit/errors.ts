export class ForcedReconnectionError extends Error {
  readonly name = 'ForcedReconnectionError';

  constructor(message: string = 'Forced reconnection due to fatal error') {
    super(message);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ForcedReconnectionError);
    }
  }
}

export default {
  ForcedReconnectionError,
};
