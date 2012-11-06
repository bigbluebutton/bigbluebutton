package org.bigbluebutton.modules.chat.model
{
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.common.LogUtil;

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
		
		[Bindable]
		public var baseTabIndex:int;
		
		public function ChatOptions() {
			var cxml:XML = 	BBB.getConfigForModule("ChatModule");
			if (cxml != null) {
				if (cxml.@privateEnabled != undefined) {
					privateEnabled = (cxml.@privateEnabled.toString().toUpperCase() == "TRUE") ? true : false;
				}
				if (cxml.@position != undefined) {
					position = cxml.@position.toString();
				}
				if (cxml.@baseTabIndex != undefined) {
					LogUtil.debug("WATERFALL-OPTIONS Setting base tab index for chat in ChatOptions");
					LogUtil.debug("WATERFALL-OPTIONS cxml.@baseTabIndex.toString() is " + cxml.@baseTabIndex.toString());
					baseTabIndex = cxml.@baseTabIndex;
					LogUtil.debug("WATERFALL-OPTIONS About to leave ChatOptions, baseTabIndex is " + baseTabIndex);
				}
			}
		}
		
		public function getBaseIndex():int{
			return baseTabIndex;
		}
	}
}