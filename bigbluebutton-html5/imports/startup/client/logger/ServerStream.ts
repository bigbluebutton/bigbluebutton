import { ServerStream } from '@browser-bunyan/server-stream';
import Auth from '/imports/ui/services/auth';

// Custom stream that logs to an end-point
export default class ServerLoggerStream extends ServerStream {
  private logTagString: string | null = null;

  private rec: Record<string, unknown> | null = null;

  constructor(params: {
    enabled: boolean;
    url?: string;
    method?: string;
    throttleInterval?: number;
    flushOnClose?: boolean;
    logTag?: string;
  }) {
    super(params);

    if (params.logTag) {
      this.logTagString = params.logTag;
    }
  }

  static getUserData() {
    const userInfo: Record<string, unknown> = {
      meetingId: Auth.meetingID,
      requesterUserId: Auth.userID,
      fullname: Auth.fullname,
      confname: Auth.confname,
      externUserID: Auth.externUserID,
      logoutUrl: Auth.logoutURL,
      sessionToken: Auth.sessionToken,
      clientSessionUUID: sessionStorage.getItem('clientSessionUUID') || '0',
    };

    return {
      fullInfo: userInfo,
    };
  }

  write(rec: Record<string, unknown>) {
    const { fullInfo } = ServerLoggerStream.getUserData();

    this.rec = rec;
    if (fullInfo.meetingId != null) {
      this.rec.userInfo = fullInfo;
    }
    this.rec.clientBuild = window.meetingClientSettings?.public?.app?.html5ClientBuild;
    if (this.logTagString) {
      this.rec.logTag = this.logTagString;
    }
    return super.write(this.rec);
  }
}
