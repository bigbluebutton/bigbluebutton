package org.bigbluebutton.air.user.models {
	
	public class User2x {
		public var intId:String;
		
		public var extId:String;
		
		public var name:String;
		
		public var role:String;
		
		public var guest:Boolean;
		
		public var authed:Boolean;
		
		public var waitingForAcceptance:Boolean;
		
		public var emoji:String = EmojiStatus.NO_STATUS;
		
		public var locked:Boolean;
		
		public var presenter:Boolean;
		
		public var avatar:String;
		
		public var me:Boolean;
	}
}
