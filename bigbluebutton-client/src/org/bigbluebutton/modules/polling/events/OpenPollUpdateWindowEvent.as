package org.bigbluebutton.modules.polling.events
{
  import flash.events.Event;
  
  public class OpenPollUpdateWindowEvent extends Event
  {
    public static const OPEN_UPDATE_WINDOW:String = "open poll update window event";
    
    private var _pollID:String;
    
    public function OpenPollUpdateWindowEvent(pollID:String)
    {
      super(OPEN_UPDATE_WINDOW, true, false);
      _pollID = pollID;
    }
    
    public function get pollID():String {
      return _pollID;
    }
  }
}