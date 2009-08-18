package org.bigbluebutton.main.events
{
	import flash.events.Event;
	
	public class MadePresenterEvent extends Event
	{
		public static const MADE_PRESENTER:String = "MadePresenter";
		
		public var presenter:Boolean;
		
		public function MadePresenterEvent(type:String = MADE_PRESENTER)
		{
			super(type, true, false);
		}

	}
}