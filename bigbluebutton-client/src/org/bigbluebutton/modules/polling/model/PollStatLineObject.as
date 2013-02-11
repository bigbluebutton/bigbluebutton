package org.bigbluebutton.modules.polling.model
{
	import mx.collections.ArrayCollection;
	import org.bigbluebutton.common.LogUtil;
	[Bindable]
	public class PollStatLineObject
	{
		public var answer:String = "empty test";
		public var votes:String = "empty test";
		public var percentage:String = "empty test";
		
		public function toString():String{
			return answer + " " + votes + " " + percentage;
		}
	}
}