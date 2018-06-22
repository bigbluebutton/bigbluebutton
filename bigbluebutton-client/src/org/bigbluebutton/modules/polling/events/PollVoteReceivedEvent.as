package org.bigbluebutton.modules.polling.events {
	import flash.events.Event;
	
	public class PollVoteReceivedEvent extends Event {
		public static const POLL_VOTE_RECEIVED:String = "poll vote received";
		
		public var pollId:String;
		public var userId:String;
		public var answerId:int;
		
		public function PollVoteReceivedEvent(pollId:String, userId:String, answerId:int) {
			super(POLL_VOTE_RECEIVED, false, false);
			
			this.pollId = pollId;
			this.userId = userId;
			this.answerId = answerId;
		}
	}
}