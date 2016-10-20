package org.bigbluebutton.api.messaging.messages;

public class EndBreakoutRoom implements IMessage {
  public final String breakoutId;

  public EndBreakoutRoom(String breakoutId) {
    this.breakoutId = breakoutId;
  }
}
