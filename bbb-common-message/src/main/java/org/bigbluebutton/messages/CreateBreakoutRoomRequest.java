package org.bigbluebutton.messages;

import org.bigbluebutton.common.messages.IBigBlueButtonMessage;

public class CreateBreakoutRoomRequest implements IBigBlueButtonMessage {
  public final static String NAME = "CreateBreakoutRoomRequest";
  
  public final Header header;
  public final CreateBreakoutRoomRequestPayload payload;
  
  public CreateBreakoutRoomRequest(CreateBreakoutRoomRequestPayload payload) {
    this.header = new Header(NAME);
    this.payload = payload;
  }
  
  static class CreateBreakoutRoomRequestPayload {
    public final String meetingId;      // The main meeting internal id
    public final String name;               // The name of the breakout room
    public final String voiceConfId;        // The voice conference id
    public final String viewerPassword;
    public final String moderatorPassword;
    public final Integer durationInMinutes; // The duration of the breakout room
    public final String defaultPresentationURL;
    
    public CreateBreakoutRoomRequestPayload(String meetingId, String name, 
        String voiceConfId, String viewerPassword, String moderatorPassword, 
        Integer duration, String defaultPresentationURL) {
      this.meetingId = meetingId;
      this.name = name;
      this.voiceConfId = voiceConfId;
      this.viewerPassword = viewerPassword;
      this.moderatorPassword = moderatorPassword;
      this.durationInMinutes = duration;
      this.defaultPresentationURL = defaultPresentationURL;
    }
  }
}
