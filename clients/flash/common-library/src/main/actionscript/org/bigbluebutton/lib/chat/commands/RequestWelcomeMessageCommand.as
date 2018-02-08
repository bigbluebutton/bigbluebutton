package org.bigbluebutton.lib.chat.commands {
	import org.bigbluebutton.lib.chat.services.IChatMessageService;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class RequestWelcomeMessageCommand extends Command {
		
		[Inject]
		public var chatService:IChatMessageService;
		
		override public function execute():void {
			chatService.sendWelcomeMessage();
		}
	}
}
