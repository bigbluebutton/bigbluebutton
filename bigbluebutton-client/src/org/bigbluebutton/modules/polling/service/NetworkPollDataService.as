package org.bigbluebutton.modules.polling.service
{
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;

  public class NetworkPollDataService implements IPollDataService
  {
	private static const LOGGER:ILogger = getClassLogger(NetworkPollDataService);      
    
    private var sender:MessageSender;
          
	public function NetworkPollDataService(sender: MessageSender) {
		this.sender = sender;
	}

    public function startCustomPoll(pollId:String, pollType: String, answers: Array):void
    {
      sender.startCustomPoll(pollId, pollType, answers);
    }

    public function startPoll(pollId:String, pollType: String):void
    {
      sender.startPoll(pollId, pollType);
    }
    
    public function stopPoll(pollID:String):void
    {
      sender.stopPoll(pollID);
    }
    
    public function votePoll(pollId:String, answerId:Number):void
    {
      sender.votePoll(pollId, answerId);
    }
    
    public function showPollResult(pollId:String):void
    {
      sender.showPollResult(pollId);
    }
  }
}