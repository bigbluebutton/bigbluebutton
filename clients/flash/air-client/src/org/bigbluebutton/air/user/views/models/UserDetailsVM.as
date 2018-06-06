package org.bigbluebutton.air.user.views.models {
	import org.bigbluebutton.air.user.models.EmojiStatus;

	public class UserDetailsVM 	{
		public var userName:String = "";
		
		public var userModerator:Boolean = false;
		
		public var userPresenter:Boolean = false;
		
		public var userEmoji:String = EmojiStatus.NO_STATUS;
		
		public var userLocked:Boolean = false;
		
		public var userHasWebcam:Boolean = false;
		
		public var userVoiceJoined:Boolean = false;
		
		public var userMuted:Boolean = false;
		
		public var amIModerator:Boolean = false;
		
		public var me:Boolean = false;
		
		public var roomLocked:Boolean = false;
	}
}