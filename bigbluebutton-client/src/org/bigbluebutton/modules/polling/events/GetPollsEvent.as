package org.bigbluebutton.modules.polling.events
{
  import flash.events.Event;
  
  public class GetPollsEvent extends Event
  {
    public static const GET_POLLS:String = "get polls event";
    
    public function GetPollsEvent()
    {
      super(GET_POLLS, true, false);
    }
  }
}