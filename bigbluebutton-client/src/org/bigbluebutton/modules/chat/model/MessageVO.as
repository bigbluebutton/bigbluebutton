package org.bigbluebutton.modules.chat.model
{
	public class MessageVO
	{
		public var message:String;
		public var recepient:String;
		public var sender:String;
		
		public function MessageVO(message:String, sender:String, recepient:String)
		{
			this.message = message;
			this.recepient = recepient;
			this.sender = sender;
		}

	}
}