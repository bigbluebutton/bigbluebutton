package org.bigbluebutton.api.util;

import java.util.Collection;

public class MeetingsResponse {

  public final Collection<MeetingResponseDetail> meetings;

  public MeetingsResponse(Collection<MeetingResponseDetail> meetings) {
    this.meetings = meetings;
  }
}
