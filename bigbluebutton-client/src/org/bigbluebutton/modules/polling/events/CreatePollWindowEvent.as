package org.bigbluebutton.modules.polling.events
{
  import flash.events.Event;
  
  public class CreatePollWindowEvent extends Event
  {
    public static const OPEN_WINDOW:String = "open create poll window event";
    public static const CLOSE_WINDOW:String = "close create poll window event";
    
    public function CreatePollWindowEvent(type:String)
    {
      super(type, true, false);
    }
  }
}