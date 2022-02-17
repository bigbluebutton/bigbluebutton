package org.bigbluebutton.api.messaging.messages;

public class KeepAliveReply implements IMessage {
	
  public final String system;
  public final Long bbbWebTimestamp;
  public final Long akkaAppsTimestamp;

  public KeepAliveReply(String system, Long bbbWebTimestamp, Long akkaAppsTimestamp) {
  	this.system = system;
  	this.bbbWebTimestamp = bbbWebTimestamp;
  	this.akkaAppsTimestamp = akkaAppsTimestamp;
  }
}
