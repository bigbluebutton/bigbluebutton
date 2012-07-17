package org.bigbluebutton.modules.chat.model
{
	/*
	 *  This class has been setted his attributes to public, for serialize with the model of the bigbluebutton-apps, in order
	 *  to enable the communication. This class is used for send public and private.
	 **/
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

		/*public function toString() : String {
			var result:String;
			// Remember to localize this later
			result = "User " + username + " said " + message + " at " + time;  
			return result;
		}*/
	}
}