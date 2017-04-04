package org.bigbluebutton.api.util;


import org.bigbluebutton.api.domain.Meeting;

public class MeetingResponseDetail {

  private final String createdOn;
  private final Meeting meeting;

  public MeetingResponseDetail(String createdOn, Meeting meeting) {
    this.createdOn = createdOn;
    this.meeting = meeting;
  }

  public String getCreatedOn() {
    return createdOn;
  }

  public Meeting getMeeting() {
    return meeting;
  }
}
