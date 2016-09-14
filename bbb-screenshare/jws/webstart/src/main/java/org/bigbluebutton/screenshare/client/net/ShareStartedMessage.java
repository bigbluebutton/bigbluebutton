package org.bigbluebutton.screenshare.client.net;

public class ShareStartedMessage implements Message {

  public final String meetingId;
  public final String streamId;
  public final int width;
  public final int height;
  public final String session;
  
  public ShareStartedMessage(String meetingId, String streamId, int width, int height, String session) {
    this.meetingId = meetingId;
    this.streamId = streamId;
    this.width = width;
    this.height = height;
    this.session = session;
  }
  
  @Override
  public MessageType getMessageType() {
    return Message.MessageType.STARTED;
  }

}
