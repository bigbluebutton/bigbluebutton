package org.bigbluebutton.air.chat.commands {
	import org.bigbluebutton.air.chat.models.GroupChat;
	import org.bigbluebutton.air.chat.services.IChatMessageService;
	import org.bigbluebutton.air.main.models.IMeetingData;
	import org.bigbluebutton.air.main.models.IUserSession;
	import org.bigbluebutton.air.user.models.User2x;
	
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
