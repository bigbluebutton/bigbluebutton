package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class FlashJoinVoiceConferenceCommand extends Event
  {
    public static const FLASH_JOIN_VOICE_CONF:String = "flash join voice conference command";
    
    public var listenOnly:Boolean = false;
    
    public function FlashJoinVoiceConferenceCommand(listenOnly:Boolean)
    {
      super(FLASH_JOIN_VOICE_CONF, true, false);
      this.listenOnly = listenOnly;
    }
  }
}