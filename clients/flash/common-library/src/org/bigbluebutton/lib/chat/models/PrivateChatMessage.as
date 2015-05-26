package org.bigbluebutton.lib.chat.models {
	
	public class PrivateChatMessage {
		public static const UNKNOWN_USER:String = "UNKNOWN USER";
		
		private var _userID:String = UNKNOWN_USER;
		
		private var _userName:String;
		
		private var _userOnline:Boolean = true;
		
		private var _privateChat:ChatMessages = new ChatMessages();
		
		public function get userID():String {
			return _userID;
		}
		
		public function set userOnline(value:Boolean):void {
			_userOnline = value;
		}
		
		public function get userOnline():Boolean {
			return _userOnline;
		}
		
		public function set userID(value:String):void {
			_userID = value;
		}
		
		public function get userName():String {
			return _userName;
		}
		
		public function set userName(value:String):void {
			_userName = value;
		}
		
		public function get privateChat():ChatMessages {
			return _privateChat;
		}
		
		/* I don't think we need a public setter
		public function set privateChat(value:ChatMessages):void {
			_privateChat = value;
			_privateChat.chatMessageChangeSignal.dispatch();
		}
		*/
	}
}
