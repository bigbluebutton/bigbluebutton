package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class WebRTCJoinedVoiceConferenceEvent extends Event
  {
    public static const JOINED_VOICE_CONFERENCE:String = "webrtc joined voice conference event";
    
    public function WebRTCJoinedVoiceConferenceEvent()
    {
      super(JOINED_VOICE_CONFERENCE, true, false);
    }
  }
}