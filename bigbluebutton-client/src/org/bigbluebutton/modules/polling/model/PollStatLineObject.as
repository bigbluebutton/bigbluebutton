package org.bigbluebutton.modules.polling.model
{
	import mx.collections.ArrayCollection;
	import org.bigbluebutton.common.LogUtil;
	[Bindable]
	public class PollStatLineObject
	{
		public var answer:String;
		public var votes:String;
		public var percentage:String;
		
		public function debug():String{
			return answer + " " + votes + " " + percentage;
		}
	}
}