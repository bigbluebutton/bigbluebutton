package org.bigbluebutton.air.poll.commands {
	import org.bigbluebutton.air.main.models.IMeetingData;
	import org.bigbluebutton.air.poll.services.IPollService;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class RespondToPollCommand extends Command {
		
		[Inject]
		public var pollService:IPollService;
		
		[Inject]
		public var meetingData:IMeetingData;
		
		[Inject]
		public var answer:String;
		
		override public function execute():void {
			meetingData.polls.voteCurrentPoll();
			pollService.votePoll(meetingData.polls.getCurrentPoll().id, answer);
		}
	}
}
