package org.bigbluebutton.main.events
{
	import flash.events.Event;
	
	public class MadePresenterEvent extends Event
	{
		public static const BECOME_PRESENTER:String = "MadePresenter";
		
		public var presenter:Boolean;
		
		public function MadePresenterEvent(type:String = BECOME_PRESENTER)
		{
			super(type, true, false);
		}

	}
}