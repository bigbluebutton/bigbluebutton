package org.bigbluebutton.modules.polling.events
{
  import flash.events.Event;
  
  import org.bigbluebutton.modules.polling.vo.CreatePollVO;
  
  public class CreatePollEvent extends Event
  {
    public static const CREATE_POLL:String = "create poll event";
    
    private var _poll:CreatePollVO;
    
    public function CreatePollEvent(poll:CreatePollVO)
    {
      super(CREATE_POLL, true, false);
      _poll = poll;
    }
    
    public function get poll():CreatePollVO {
      return _poll;
    }
  }
}