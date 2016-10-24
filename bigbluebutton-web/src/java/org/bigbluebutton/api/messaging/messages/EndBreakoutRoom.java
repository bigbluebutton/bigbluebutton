package org.bigbluebutton.api.messaging.messages;

public class EndBreakoutRoom implements IMessage {
  public final String breakoutMeetingId;

  public EndBreakoutRoom(String breakoutMeetingId) {
    this.breakoutMeetingId = breakoutMeetingId;
  }
}
