package org.bigbluebutton.modules.chat.model
{
	import org.bigbluebutton.core.BBB;

	public class ChatOptions
	{
		[Bindable]
		public var translationOn:Boolean = true;
		
		[Bindable]
		public var translationEnabled:Boolean = true;
		
		[Bindable]
		public var privateEnabled:Boolean = true;
		
		[Bindable]
		public var position:String = "top-right";
		
		public function ChatOptions() {
			var cxml:XML = 	BBB.getConfigForModule("ChatModule");
			if (cxml != null) {
				if (cxml.@privateEnabled != undefined) {
					privateEnabled = (cxml.@privateEnabled.toString().toUpperCase() == "TRUE") ? true : false;
				}
				if (cxml.@position != undefined) {
					position = cxml.@position.toString();
				}
			}
		}
	}
}