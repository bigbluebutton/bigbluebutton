package org.bigbluebutton.modules.polling.service
{
  import org.bigbluebutton.modules.polling.vo.CreatePollVO;
  import org.bigbluebutton.modules.polling.vo.UpdatePollVO;
  import org.bigbluebutton.modules.polling.vo.PollResponseVO;

  public interface IPollDataService
  {
   
    function getPolls():void;
    
    function createPoll(poll:CreatePollVO):void;
    
    function updatePoll(poll:UpdatePollVO):void;
    
    function startPoll(pollID:String):void;
    
    function stopPoll(pollID:String):void;
    
    function removePoll(pollID:String):void;
    
    function respondPoll(resp:PollResponseVO):void;
  }
}