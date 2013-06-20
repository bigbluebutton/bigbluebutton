package org.bigbluebutton.modules.polling.events
{
  import flash.events.Event;
  
  public class PollEvent extends Event
  {
    public static const POLL_CREATED:String = "poll created event";
    public static const POLL_UPDATED:String = "poll updated event";
    public static const POLL_STARTED:String = "poll started event";
    public static const POLL_STOPPED:String = "poll stopped event";
    public static const POLL_DESTROYED:String = "poll destroyed event";
    public static const POLL_RESULTS_UPDATED:String = "poll results updated";
    
    private var _pollID:String;
    
    public function PollEvent(type:String, pollID:String)
    {
      super(type, true, false);
      _pollID = pollID;
    }
    
    private function get pollID():String {
      return _pollID;
    }
  }
}