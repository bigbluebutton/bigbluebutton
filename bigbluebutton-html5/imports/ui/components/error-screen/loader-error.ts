/**
 * Shared failure classification for SettingsLoader and CustomUsersSettings, which run before the
 * client can show any real UI. Both fetch through nginx's `auth_request`, which answers 401 once
 * bbb-web no longer knows the session token - what every stale invite link does - so that gets its
 * own error code instead of the generic "something went wrong". It used to be told apart only by
 * accident, by `resp.json()` choking on nginx's HTML 401 page.
 */

interface LoaderError extends Error {
  httpStatus?: number;
  sessionEnded?: boolean;
}

// nginx answers 401 for an unknown/expired session token; see ConnectionController#checkGraphqlAuthorization.
const SESSION_EXPIRED_STATUS = 401;

export const ERROR_CODE_GENERIC = '500';
export const ERROR_CODE_SESSION_ENDED = '410';

// Description keys the error screen maps to localized, actionable messages. Every failure gets one:
// a bare headline with nothing under it is what made the old screen useless.
export const SESSION_ENDED_DESCRIPTION = 'meeting_ended';
// For failures we cannot name, the one thing that helps is still true - reload and try again.
export const RETRY_DESCRIPTION = 'able_to_rejoin_user_disconnected_reason';
export const MISSING_TOKEN_DESCRIPTION = 'param_missing';

/** Turns a non-2xx response into a throw `isSessionExpired` can recognize at the catch site. */
export const rejectOnHttpError = (response: Response): Response => {
  if (!response.ok) {
    const error: LoaderError = new Error(`Request failed with status ${response.status}`);
    error.httpStatus = response.status;
    throw error;
  }

  return response;
};

/**
 * Same verdict without an HTTP status: bbb-web keeps answering for a removed user's token, so an
 * ended meeting can pass the auth check and still come back with no meeting at all.
 */
export const sessionEndedError = (message: string): Error => {
  const error: LoaderError = new Error(message);
  error.sessionEnded = true;

  return error;
};

export const isSessionExpired = (error: unknown): boolean => {
  const loaderError = error as LoaderError | null;

  return loaderError?.sessionEnded === true || loaderError?.httpStatus === SESSION_EXPIRED_STATUS;
};
