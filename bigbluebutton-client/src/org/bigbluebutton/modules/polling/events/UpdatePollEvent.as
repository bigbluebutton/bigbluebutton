package org.bigbluebutton.modules.polling.events
{
  import flash.events.Event;
  
  import org.bigbluebutton.modules.polling.vo.UpdatePollVO;
  
  public class UpdatePollEvent extends Event
  {
    public static const UPDATE_POLL:String = "update poll event";
    
    public var poll:UpdatePollVO;
    
    public function UpdatePollEvent()
    {
      super(UPDATE_POLL, true, false);
    }
  }
}