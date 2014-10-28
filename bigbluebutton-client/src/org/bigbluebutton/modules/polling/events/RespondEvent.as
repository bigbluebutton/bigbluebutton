package org.bigbluebutton.modules.polling.events
{
  import flash.events.Event;
  
  import org.bigbluebutton.modules.polling.vo.PollResponseVO;
  
  public class RespondEvent extends Event
  {
    public static const RESPOND_EVENT:String = "respond to poll event";
    
    private var _response:PollResponseVO;
    
    public function RespondEvent(response:PollResponseVO)
    {
      super(RESPOND_EVENT, true, false);
      _response = response;
    }
    
    public function get response():PollResponseVO {
      return _response;
    }
  }
}