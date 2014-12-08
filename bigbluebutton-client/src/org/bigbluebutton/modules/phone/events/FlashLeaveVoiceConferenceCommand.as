package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class FlashLeaveVoiceConferenceCommand extends Event
  {
    public static const FLASH_LEAVE_VOICE_CONF:String = "flash leave voice conference command";
    
    public function FlashLeaveVoiceConferenceCommand()
    {
      super(FLASH_LEAVE_VOICE_CONF, true, false);
    }
  }
}