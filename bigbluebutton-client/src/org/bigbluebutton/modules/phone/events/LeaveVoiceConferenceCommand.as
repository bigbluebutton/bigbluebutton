package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class LeaveVoiceConferenceCommand extends Event
  {
    public static const LEAVE_VOICE_CONF:String = "leave voice conference command";
    
    public function LeaveVoiceConferenceCommand()
    {
      super(LEAVE_VOICE_CONF, true, false);
    }
  }
}