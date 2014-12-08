package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class FlashJoinedVoiceConferenceEvent extends Event
  {
    public static const JOINED_VOICE_CONFERENCE:String = "flash joined voice conference event";
    
    public function FlashJoinedVoiceConferenceEvent()
    {
      super(JOINED_VOICE_CONFERENCE, true, false);
    }
  }
}