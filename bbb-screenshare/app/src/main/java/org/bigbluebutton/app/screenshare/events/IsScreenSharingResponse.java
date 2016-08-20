package org.bigbluebutton.app.screenshare.events;

import org.bigbluebutton.app.screenshare.Error;
import org.bigbluebutton.app.screenshare.StreamInfo;

public class IsScreenSharingResponse implements IEvent {

  public final String meetingId;
  public final String userId;
  public final String session;
  public final StreamInfo info;
  
  public IsScreenSharingResponse(String meetingId, String userId, String session, StreamInfo info) {
    this.meetingId = meetingId;
    this.userId = userId;
    this.session = session;
    this.info = info;
  }
}
