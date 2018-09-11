package org.bigbluebutton.air.poll.services {
	import org.bigbluebutton.air.common.models.IMessageListener;
	import org.bigbluebutton.air.main.models.IMeetingData;
	import org.bigbluebutton.air.poll.models.PollAnswer;
	import org.bigbluebutton.air.poll.models.PollVO;
	
	public class PollMessageReceiver implements IMessageListener {
		
		public var meetingData:IMeetingData;
		
		public function onMessage(messageName:String, message:Object):void {
			switch (messageName) {
				case "PollStartedEvtMsg":
					handlePollStarted(message);
					break;
				case "PollStoppedEvtMsg":
					handlePollStopped(message);
					break;
				case "PollShowResultEvtMsg":
					handlePollShowResult(message);
				default:
					break;
			}
		}
		
		public function handlePollStarted(msg:Object):void {
			var pollId:String = msg.body.pollId;
			var answers:Array = msg.body.poll.answers as Array;
			
			var ans:Array = new Array();
			for (var j:int = 0; j < answers.length; j++) {
				var a:Object = answers[j];
				ans.push(new PollAnswer(Number(String(a.id)), a.key));
			}
			
			var newPoll:PollVO = new PollVO(pollId, ans);
			meetingData.polls.setCurrentPoll(newPoll);
		}
		
		public function handlePollStopped(msg:Object):void {
			meetingData.polls.removeCurrentPoll();
		}
		
		public function handlePollShowResult(msg:Object):void {
			// This is sent when the presenter publishes the poll result and contains pollId and
			// the voting results. For now just remove the active poll
			meetingData.polls.removeCurrentPoll();
		}
	}
}
