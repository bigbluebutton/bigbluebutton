package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class WebRtcCallProgressEvent extends Event
  {
    
    public static const WEBRTC_CALL_PROGRESS:String = "webrtc call progress event";
    
    public var progress:String;
    
    public function WebRtcCallProgressEvent(progress:String)
    {
      super(WEBRTC_CALL_PROGRESS, true, false);
      this.progress = progress;
    }
  }
}