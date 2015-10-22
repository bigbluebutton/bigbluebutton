package org.bigbluebutton.messages;

import org.bigbluebutton.common.messages.IBigBlueButtonMessage;

public class CreateMeetingRequest implements IBigBlueButtonMessage {
  public final static String NAME = "CreateMeetingRequest";
  
  public final Header header;
  public final CreateMeetingRequestPayload payload;
  
  public CreateMeetingRequest(CreateMeetingRequestPayload payload) {
    this.header = new Header(NAME);
    this.payload = payload;
  }
  
  public static class CreateMeetingRequestPayload {
    public final String id;
    public final String externalId;
    public final String name;
    public final Boolean record;
    public final String voiceBridge;
    public final Long duration;
    public final Boolean autoStartRecording;
    public final Boolean allowStartStopRecording;
    public final String moderatorPass;
    public final String viewerPass;
    public final Long createTime;
    public final String createDate;
    public final Boolean isBreakout;
    
    public CreateMeetingRequestPayload(String id, String externalId, String name, Boolean record, String voiceBridge, 
        Long duration, Boolean autoStartRecording, 
        Boolean allowStartStopRecording, String moderatorPass,
        String viewerPass, Long createTime, String createDate, Boolean isBreakout) {
      this.id = id;
      this.externalId = externalId;
      this.name = name;
      this.record = record;
      this.voiceBridge = voiceBridge;
      this.duration = duration; 
      this.autoStartRecording = autoStartRecording;
      this.allowStartStopRecording = allowStartStopRecording;
      this.moderatorPass = moderatorPass;
      this.viewerPass = viewerPass;
      this.createTime = createTime;
      this.createDate = createDate;
      this.isBreakout = isBreakout;
    }
  }
}
