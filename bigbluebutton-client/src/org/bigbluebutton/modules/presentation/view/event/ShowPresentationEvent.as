package org.bigbluebutton.modules.presentation.view.event
{
	import flash.events.Event;

	public class ShowPresentationEvent extends Event
	{
		public static const SHOW_PRESENTATION_EVENT:String = "SHOW_PRESENTATION_EVENT";
		
		public var presentationName:String;
				
		public function ShowPresentationEvent(presentationName:String)
		{
			super(SHOW_PRESENTATION_EVENT, false);
			this.presentationName = presentationName;
		}		
	}
}