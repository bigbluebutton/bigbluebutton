package org.bigbluebutton.air.chat.commands {
	import org.bigbluebutton.air.chat.services.IChatMessageService;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class RequestWelcomeMessageCommand extends Command {
		
		[Inject]
		public var chatService:IChatMessageService;
		
		override public function execute():void {
			chatService.sendWelcomeMessage();
		}
	}
}
