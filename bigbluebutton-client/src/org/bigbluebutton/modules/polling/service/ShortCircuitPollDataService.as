package org.bigbluebutton.modules.polling.service
{
  import org.bigbluebutton.modules.polling.vo.CreatePollVO;
  import org.bigbluebutton.modules.polling.vo.PollResponseVO;
  import org.bigbluebutton.modules.polling.vo.UpdatePollVO;
  
  /***
  * Used for development and testing where we short circuit the message
  * path. Instead of sending the message to the server, we short-circuit it
  * here.
  */
  public class ShortCircuitPollDataService implements IPollDataService
  {
    private static const LOG:String = "Poll::ShortCircuitPollDataService - ";
    
    /* Injected by Mate */
    public var processor:PollDataProcessor;
    
    
    public function getPolls():void
    {
    }
    
    public function createPoll(poll:CreatePollVO):void
    {
    }
    
    public function updatePoll(poll:UpdatePollVO):void
    {
    }
    
    public function startPoll(pollID:String):void
    {
    }
    
    public function stopPoll(pollID:String):void
    {
    }
    
    public function removePoll(pollID:String):void
    {
    }
    
    public function respondPoll(resp:PollResponseVO):void
    {
    }
  }
}