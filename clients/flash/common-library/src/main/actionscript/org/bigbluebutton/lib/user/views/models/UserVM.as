package org.bigbluebutton.lib.user.views.models {
	import org.bigbluebutton.lib.user.models.EmojiStatus;
	import org.bigbluebutton.lib.user.models.UserRole;
	
	[Bindable]
	public class UserVM {
		// Base User properties
		
		public var me:Boolean = false;
		
		public var intId:String = "UNKNOWN USER";
		
		public var extId:String = "UNKNOWN USER";
		
		public var name:String;
		
		public var role:String = UserRole.VIEWER;
		
		public var presenter:Boolean = false;
		
		public var locked:Boolean = false;
		
		public var roomLocked:Boolean = false;
		
		public var avatarURL:String = "";
		
		public var emoji:String = EmojiStatus.NO_STATUS;
		
		// Voice properties
		
		public var inVoiceConf:Boolean = false;
		
		public var muted:Boolean = false;
		
		public var talking:Boolean = false;
		
		public var phoneUser:Boolean = false;
		
		public var listenOnly:Boolean = false;
		
		// Webcam properties
		
		public var hasStream:Boolean = false;
		
		
		
		public function UserVM() {
		}
	}
}
