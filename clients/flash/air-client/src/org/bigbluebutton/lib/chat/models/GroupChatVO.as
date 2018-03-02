package org.bigbluebutton.lib.chat.models {
	import mx.collections.ArrayCollection;
	
	public class GroupChatVO {
		public var id:String;
		
		public var name:String;
		
		public var access:String;
		
		public var createdBy:GroupChatUser;
		
		public var users:Array;
	}
}
