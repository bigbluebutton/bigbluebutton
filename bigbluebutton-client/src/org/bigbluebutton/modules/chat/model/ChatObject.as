package org.bigbluebutton.modules.chat.model
{
	[Bindable]
	[RemoteClass(alias="org.bigbluebutton.conference.service.chat.ChatObject")]
	public class ChatObject
	{
		public var message:String;
		public var username:String;
		public var color:String;
		public var time:String;
		public var language:String; 
		public var userid:String;

	}
}