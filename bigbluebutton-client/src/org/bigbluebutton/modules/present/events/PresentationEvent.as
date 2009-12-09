package org.bigbluebutton.modules.present.events
{
	import flash.events.Event;
	
	import org.bigbluebutton.modules.present.managers.PresentationSlides;
	
	public class PresentationEvent extends Event
	{
		public static const PRESENTATION_LOADED:String = "Presentation Loaded";
		public static const PRESENTATION_NOT_LOADED:String = "Presentation Not Loaded";
		
		public var presentationName:String;
		public var slides:PresentationSlides;
		
		public function PresentationEvent(type:String)
		{
			super(type, true, false);
		}

	}
}