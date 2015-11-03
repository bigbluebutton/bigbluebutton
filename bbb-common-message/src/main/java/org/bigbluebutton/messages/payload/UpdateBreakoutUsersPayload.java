package org.bigbluebutton.messages.payload;

import java.util.ArrayList;

public class UpdateBreakoutUsersPayload {

  public final ArrayList<BreakoutUserPayload> users;
  public final String breakoutId;
  public final String meetingId;
  
  public UpdateBreakoutUsersPayload(String meetingId, String breakoutId, ArrayList<BreakoutUserPayload> users) {
    this.meetingId = meetingId;
    this.breakoutId = breakoutId;
    this.users = users;
  }
}
