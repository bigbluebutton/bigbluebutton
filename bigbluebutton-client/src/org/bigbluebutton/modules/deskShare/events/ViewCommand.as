package org.bigbluebutton.modules.deskShare.events
{
	import flash.events.Event;
	
	public class ViewCommand extends Event
	{
		public static const START:String = "StartViewingCommand";
		public static const STOP:String = "StopViewingCommand";
		
		public var captureWidth:Number;
		public var captureHeight:Number;
		
		public function ViewCommand(type:String)
		{
			super(type, true, false);
		}

	}
}