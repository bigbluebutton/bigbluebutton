package org.bigbluebutton.presentation.events
{
	import flash.events.Event;

	public class PresentationEvent extends Event
	{
		public static const SHARE_PRESENTATION:String = "SHARE_PRESENTATION";
		public static const UPDATE_SLIDE:String = "UPDATE_SLIDE";
		
		public var share:Boolean;
		public var presentationName:String;
		public var pageNum:Number;
		
		public function PresentationEvent(type:String)
		{
			super(type, true, false);
		}
	}
}