import http, { IncomingHttpHeaders } from "http";
import { config } from "../config";
import { toBoolean } from "./utils";

interface UserInformation {
  userId: string;
  userName: string;
  meetingId: string;
  userIsModerator: boolean;
}

interface SecurityInformation {
  cookie: string | null,
  sessionToken: string | null,
}

export async function getUserInformation(
  securityInformation: SecurityInformation,
): Promise<UserInformation | null> {
  const {
    cookie,
    sessionToken, 
  } = securityInformation;

  const {
    host,
    port,
    checkAuthorizationEndpoint,
  } = config.bbbWeb;

  const checkAuthorizationUrlString = `http://${host}:${port}/${checkAuthorizationEndpoint}`;
  const checkAuthorizationUrl = new URL(checkAuthorizationUrlString);

  if (!cookie || !sessionToken) return null;

  return new Promise((resolve) => {
    const options = {
      method: 'GET',
      headers: {
        'Cookie': cookie || '',
        'X-session-token': sessionToken
      }
    };

    const req = http.request(checkAuthorizationUrl, options, (res) => {
      if (res.statusCode !== 200) resolve(null);
      const checkHeaders = () => (
        'user-external-id' in res.headers
        && 'user-name' in res.headers
        && 'meeting-id' in res.headers
        && 'user-is-moderator' in res.headers
      );
      const headersCorrect = checkHeaders();

      if (!headersCorrect) resolve(null);

      const userInfo: UserInformation = {
        userId: res.headers['user-external-id'] as string,
        userName: res.headers['user-name'] as string,
        meetingId: res.headers['meeting-id'] as string,
        userIsModerator: toBoolean(res.headers['user-is-moderator'] as string),
      }
      resolve(userInfo);
    });

    req.on('error', () => {
      resolve(null);
    });

    req.end();
  });
}


function checkBbbWebResult(
  userInformation: UserInformation,
  responseHeaders: IncomingHttpHeaders,
) {
  const checkUserId: () => boolean = () => (
    'user-external-id' in responseHeaders
    ) && responseHeaders['user-external-id'] === userInformation.userId;
  const checkUserName: () => boolean = () => (
    'user-name' in responseHeaders
    ) && responseHeaders['user-name'] === userInformation.userName;
  return checkUserId() && checkUserName();
}

export async function checkUserAuthenticated(
  userInformation: UserInformation,
  securityInformation: SecurityInformation,
): Promise<boolean> {
  const {
    cookie,
    sessionToken, 
  } = securityInformation;

  const {
    host,
    port,
    checkAuthorizationEndpoint,
  } = config.bbbWeb;

  const checkAuthorizationUrlString = `http://${host}:${port}/${checkAuthorizationEndpoint}`;
  const checkAuthorizationUrl = new URL(checkAuthorizationUrlString);

  if (!cookie || !sessionToken) return false;

  return new Promise((resolve) => {
    const options = {
      method: 'GET',
      headers: {
        'Cookie': cookie || '',
        'X-session-token': sessionToken
      }
    };

    const req = http.request(checkAuthorizationUrl, options, (res) => {
      const isUserInformationCorrect = checkBbbWebResult(
        userInformation, res.headers
      )
      resolve(res.statusCode === 200 && isUserInformationCorrect);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.end();
  });
}
