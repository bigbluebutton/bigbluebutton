package org.bigbluebutton.modules.polling.service
{
  import org.bigbluebutton.modules.polling.vo.CreatePollVO;
  import org.bigbluebutton.modules.polling.vo.PollResponseVO;
  import org.bigbluebutton.modules.polling.vo.UpdatePollVO;

  public interface IPollDataService
  {
       
    function startPoll(pollId:String, pollType: String):void;
    
    function stopPoll(pollID:String):void;
    
    function votePoll(pollId:String, answerId:Number):void;
    
    function showPollResult(pollId:String, show:Boolean):void;
  }
}