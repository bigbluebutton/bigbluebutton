package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class WebRtcCallStartedEvent extends Event
  {
    public static const WEBRTC_CALL_STARTED:String = "webrtc call started event";
    
    public var hasLocalStream:Boolean = false;
    public var hasRemoteStream:Boolean = false;
    
    public function WebRtcCallStartedEvent(localStream:Boolean, remoteStream:Boolean)
    {
      super(WEBRTC_CALL_STARTED, true, false);
      hasLocalStream = localStream;
      hasRemoteStream = remoteStream;
    }
  }
}