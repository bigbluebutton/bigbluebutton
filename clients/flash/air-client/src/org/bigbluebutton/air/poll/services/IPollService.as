package org.bigbluebutton.air.poll.services {
	
	public interface IPollService {
		function setupMessageSenderReceiver():void;
		function votePoll(pollId:String, answerId:String):void;
	}
}
