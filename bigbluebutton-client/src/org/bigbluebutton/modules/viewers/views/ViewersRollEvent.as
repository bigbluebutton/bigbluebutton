package org.bigbluebutton.modules.viewers.views
{
	import flash.events.Event;

	public class ViewersRollEvent extends Event
	{
		public static const VIEWERS_ROLL_OVER:String = "ViewersRollOver";
		public static const VIEWERS_ROLL_OUT:String = "ViewersRollOut";
		
		public var userid:Number;
		
		public function ViewersRollEvent(type:String)
		{
			super(type, true, false);
		}
	}
}