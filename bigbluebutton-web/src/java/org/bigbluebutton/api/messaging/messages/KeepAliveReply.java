package org.bigbluebutton.api.messaging.messages;

public class KeepAliveReply implements IMessage {
  public final String pongId;
  
  public KeepAliveReply(String pongId) {
  	this.pongId = pongId;
  }
}
