package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class FlashJoinedListenOnlyVoiceConferenceEvent extends Event
  {
    public static const JOINED_LISTEN_ONLY_VOICE_CONFERENCE:String = "flash joined listen only voice conference event";
    
    public function FlashJoinedListenOnlyVoiceConferenceEvent()
    {
      super(JOINED_LISTEN_ONLY_VOICE_CONFERENCE, true, false);
    }
  }
}