package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class FlashLeftVoiceConferenceEvent extends Event
  {
    public static const LEFT_VOICE_CONFERENCE:String = "flash left voice conference event";
    
    public function FlashLeftVoiceConferenceEvent()
    {
      super(LEFT_VOICE_CONFERENCE, true, false);
    }
  }
}