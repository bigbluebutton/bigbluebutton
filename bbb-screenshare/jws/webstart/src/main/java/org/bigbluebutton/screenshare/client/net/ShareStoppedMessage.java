package org.bigbluebutton.screenshare.client.net;

public class  ShareStoppedMessage implements Message {

  public final String meetingId;
  public final String streamId;
  
  public ShareStoppedMessage(String meetingId, String streamId) {
    this.meetingId = meetingId;
    this.streamId = streamId;
  }
  
  @Override
  public MessageType getMessageType() {
    return Message.MessageType.STOPPED;
  }

}
