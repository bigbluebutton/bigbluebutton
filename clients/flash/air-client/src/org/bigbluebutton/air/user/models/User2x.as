package org.bigbluebutton.air.user.models {
	
	public class User2x {
		public var intId:String;
		
		public var extId:String;
		
		public var name:String;
		
		public var role:String;
		
		public var guest:Boolean;
		
		public var authed:Boolean;
		
		public var waitingForAcceptance:Boolean;
		
		private var _emoji:String = EmojiStatus.NO_STATUS;
		
		public var emojiStatusTime:Date;
		
		public var locked:Boolean;
		
		public var presenter:Boolean;
		
		public var avatar:String;
		
		public var me:Boolean;
		
		public function get emoji():String {
			return _emoji;
		}
		
		public function set emoji(r:String):void {
			_emoji = r;
			emojiStatusTime = (r != EmojiStatus.NO_STATUS ? new Date() : null);
		}
	}
}
