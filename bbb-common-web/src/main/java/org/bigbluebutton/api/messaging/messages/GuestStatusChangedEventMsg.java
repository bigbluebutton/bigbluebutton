package org.bigbluebutton.api.messaging.messages;

import java.util.ArrayList;

public class GuestStatusChangedEventMsg implements IMessage {

  public final String meetingId;
  public final ArrayList guests;

  public GuestStatusChangedEventMsg(String meetingId, ArrayList guests) {
    this.meetingId = meetingId;
    this.guests = guests;
  }
}
