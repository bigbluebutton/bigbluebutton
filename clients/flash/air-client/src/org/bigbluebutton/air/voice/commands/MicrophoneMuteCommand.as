package org.bigbluebutton.air.voice.commands {
	
	import org.bigbluebutton.air.main.models.IMeetingData;
	import org.bigbluebutton.air.voice.models.VoiceUser;
	import org.bigbluebutton.air.voice.services.IVoiceService;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class MicrophoneMuteCommand extends Command {
		
		[Inject]
		public var voiceService:IVoiceService;
		
		[Inject]
		public var meetingData:IMeetingData;
		
		[Inject]
		public var userId:String;
		
		override public function execute():void {
			trace("MicrophoneMuteCommand.execute() - userId = " + userId);
			var vu:VoiceUser = meetingData.voiceUsers.getUser(userId);
			if (vu != null) {
				if (vu.muted) {
					voiceService.unmute(userId);
				} else {
					voiceService.mute(userId);
				}
			}
		}
	}
}

