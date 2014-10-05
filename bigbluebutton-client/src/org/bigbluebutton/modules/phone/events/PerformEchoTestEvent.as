package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class PerformEchoTestEvent extends Event
  {
    public static const PERFORM_ECHO_TEST:String = "perform echo test event";
    
    // 'webrtc' or 'flash' 
    public var mode:String = "webrtc";
    
    public function PerformEchoTestEvent(mode:String)
    {
      super(PERFORM_ECHO_TEST, true, false);
      this.mode = mode;
    }
  }
}