package org.bigbluebutton.modules.polling.events
{
  import flash.events.Event;
  
  public class InitPollModuleEvent extends Event
  {
    public static const INITIALIZE_POLL_MODULE:String = "initialize poll module event";
    
    public function InitPollModuleEvent()
    {
      super(INITIALIZE_POLL_MODULE, true, false);
    }
  }
}