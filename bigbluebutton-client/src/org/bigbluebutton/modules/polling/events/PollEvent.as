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
    
    public static const START_POLL:String = "start poll event";
    public static const STOP_POLL:String = "stop poll event";
    public static const REMOVE_POLL:String = "remove poll event";
    public static const EDIT_POLL_REQUEST:String = "request to edit poll event";
    public static const SHOW_POLL_RESULT:String = "request to show result poll event";
    public static const USER_RESPONDED:String = "user has responded to poll event";
    
    private var _pollID:String;
    
    public function PollEvent(type:String, pollID:String)
    {
      super(type, true, false);
      _pollID = pollID;
    }
    
    public function get pollID():String {
      return _pollID;
    }
  }
}