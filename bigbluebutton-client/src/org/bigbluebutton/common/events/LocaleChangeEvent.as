package org.bigbluebutton.common.events
{
	import flash.events.Event;
	
	public class LocaleChangeEvent extends Event
	{
		public static const LOCALE_CHANGED:String = "LOCALE_CHANGED_EVENT";
		
		public function LocaleChangeEvent(type:String)
		{
			super(type, true, false);
		}
	}
}