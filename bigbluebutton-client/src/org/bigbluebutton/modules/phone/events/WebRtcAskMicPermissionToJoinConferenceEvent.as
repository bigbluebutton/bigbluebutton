package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class WebRtcAskMicPermissionToJoinConferenceEvent extends Event
  {
    public static const WEBRTC_ASK_MIC_PERMISSION_TO_JOIN_VOICE_CONFERENCE:String = "webrtc ask mic permission to join voice conference event";
    
    public var browser:String = "unknown";
    public var browserVersion:int = 0;
    
    public function WebRtcAskMicPermissionToJoinConferenceEvent(browserType:String, browserVersion:int)
    {
      super(WEBRTC_ASK_MIC_PERMISSION_TO_JOIN_VOICE_CONFERENCE, true, false);
      browser = browserType;
      this.browserVersion = browserVersion; 
    }
  }
}