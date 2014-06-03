package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class JoinVoiceConferenceCommand extends Event
  {
    public static const JOIN_VOICE_CONF:String = "join voice conference command";
    
	public var mic:Boolean = false;
	
    public function JoinVoiceConferenceCommand()
    {
      super(JOIN_VOICE_CONF, true, false);
    }
  }
}