package org.bigbluebutton.screenshare.client.net;

public class ShareUpdateMessage implements Message {

  public final String meetingId;
  public final String streamId;
  public final String session;
  
  public ShareUpdateMessage(String meetingId, String streamId, String session) {
    this.meetingId = meetingId;
    this.streamId = streamId;
    this.session = session;
  }
  
  @Override
  public MessageType getMessageType() {
    return Message.MessageType.UPDATE;
  }

}
