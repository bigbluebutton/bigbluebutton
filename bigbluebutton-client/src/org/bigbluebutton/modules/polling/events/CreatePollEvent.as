package org.bigbluebutton.modules.polling.events
{
  import flash.events.Event;
  
  import org.bigbluebutton.modules.polling.vo.CreatePollVO;
  
  public class CreatePollEvent extends Event
  {
    public static const CREATE_POLL:String = "create poll event";
    
    public var poll:CreatePollVO;
    
    public function CreatePollEvent()
    {
      super(CREATE_POLL, true, false);
    }
  }
}