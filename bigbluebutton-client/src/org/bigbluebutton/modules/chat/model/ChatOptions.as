package org.bigbluebutton.modules.chat.model
{
	public class ChatOptions
	{
		[Bindable]
		public var translationOn:Boolean = false;
		
		[Bindable]
		public var translationEnabled:Boolean = false;
		
		[Bindable]
		public var privateEnabled:Boolean = false;
		
		public function ChatOptions()
		{
		}

	}
}