package org.bigbluebutton.modules.present.events
{
	import flash.events.Event;
	
	public class MoveEvent extends Event
	{
		public static const MOVE:String = "MOVE";
		
		public var slideXPosition:Number;
		public var slideYPosition:Number;
		
		public function MoveEvent(type:String, slideXPosition:Number, slideYPosition:Number)
		{
			this.slideXPosition = slideXPosition;
			this.slideYPosition = slideYPosition;
			super(type, true, false);
		}

	}
}