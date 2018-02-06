package org.bigbluebutton.lib.chat.commands {
	import org.bigbluebutton.lib.chat.models.GroupChat;
	import org.bigbluebutton.lib.chat.services.IChatMessageService;
	import org.bigbluebutton.lib.main.models.IMeetingData;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.models.User2x;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class StartPrivateChatCommand extends Command {
		
		[Inject]
		public var chatService:IChatMessageService;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var meetingData:IMeetingData;
		
		[Inject]
		public var userId:String;
		
		override public function execute():void {
			var user:User2x = meetingData.users.getUser(userId);
			if (user) {
				chatService.createGroupChat(user.name, false, [userId]);
			}
		}
	}
}
