package org.bigbluebutton.api.messaging.messages;


public class CreateBreakoutRoom implements IMessage {

  public final String breakoutId;
  public final String parentId;      // The main meeting internal id
  public final String name;               // The name of the breakout room
  public final String voiceConfId;        // The voice conference id
  public final String viewerPassword;
  public final String moderatorPassword;
  public final Integer durationInMinutes; // The duration of the breakout room
  public final String defaultPresentationURL;
	
	public CreateBreakoutRoom(String breakoutId, String parentId, String name, 
      String voiceConfId, String viewerPassword, String moderatorPassword, 
      Integer duration, String defaultPresentationURL) {
	  this.breakoutId = breakoutId;
    this.parentId = parentId;
    this.name = name;
    this.voiceConfId = voiceConfId;
    this.viewerPassword = viewerPassword;
    this.moderatorPassword = moderatorPassword;
    this.durationInMinutes = duration;
    this.defaultPresentationURL = defaultPresentationURL;
	}
}
