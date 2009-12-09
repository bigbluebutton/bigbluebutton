package org.bigbluebutton.modules.present.events
{
	import flash.events.Event;
	
	public class PresenterCommands extends Event
	{
		public static const GOTO_SLIDE:String = "GOTO_SLIDE_COMMAND";
		public static const ZOOM:String = "ZOOM_COMMAND";
		public static const RESET_ZOOM:String = "RESTORE_ZOOM";
		public static const MOVE:String = "MOVE_COMMAND";
		public static const SHARE_PRESENTATION_COMMAND:String = "SHARE_PRESENTATION_COMMAND";
		public static const NOTIFY_LOADED:String = "NOTIFY_PRESENTATION_LOADED";
		
		//Parameter for the slide navigation events
		public var slideNumber:Number;
		
		//Parameters for the zoom event
		public var xPercent:Number;
		public var yPercent:Number;
		
		//Parameters for the move event
		public var xOffset:Number;
		public var yOffset:Number;
		
		//Parameters for the share event
		public var presentationName:String;
		public var share:Boolean;
		
		public function PresenterCommands(type:String, slideNumber:Number = 0)
		{
			this.slideNumber = slideNumber;
			super(type, true, false);
		}

	}
}