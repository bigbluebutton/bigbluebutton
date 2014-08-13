package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class WebRTCAskUserToChangeMicEvent extends Event
  {   
    public static const WEBRTC_ASK_USER_TO_CHANGE_MIC:String = "webrtc ask user to change mic event";
    
    public var browser:String = "unknown";
    
    public function WebRTCAskUserToChangeMicEvent(browserType:String)
    {
      super(WEBRTC_ASK_USER_TO_CHANGE_MIC, true, false);
      browser = browserType;
    }
  }
}