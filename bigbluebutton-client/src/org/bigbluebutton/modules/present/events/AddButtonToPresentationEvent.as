package org.bigbluebutton.modules.present.events
{
	import flash.events.Event;
	
	import org.bigbluebutton.modules.present.api.IPresentationButton;
	
	public class AddButtonToPresentationEvent extends Event
	{
		public static const ADD_BUTTON:String = "ADD_BUTTON";
		
		public var button:IPresentationButton;
		
		public function AddButtonToPresentationEvent(type:String)
		{
			super(type, true, false);
		}

	}
}