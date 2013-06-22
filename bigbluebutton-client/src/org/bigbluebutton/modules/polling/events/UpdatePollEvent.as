package org.bigbluebutton.modules.polling.events
{
  import flash.events.Event;
  
  import org.bigbluebutton.modules.polling.vo.UpdatePollVO;
  
  public class UpdatePollEvent extends Event
  {
    public static const UPDATE_POLL:String = "update poll event";
    
    private var _poll:UpdatePollVO;
    
    public function UpdatePollEvent(poll:UpdatePollVO)
    {
      super(UPDATE_POLL, true, false);
      _poll = poll;
    }
    
    public function get poll():UpdatePollVO {
      return _poll;
    }
  }
}