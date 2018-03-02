package org.bigbluebutton.lib.chat.commands {
	import org.bigbluebutton.lib.chat.services.IChatMessageService;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class RequestGroupChatHistoryCommand extends Command {
		
		[Inject]
		public var chatService:IChatMessageService;
		
		[Inject]
		public var chatId:String;
		
		override public function execute():void {
			chatService.getGroupChatHistory(chatId);
		}
	}
}
