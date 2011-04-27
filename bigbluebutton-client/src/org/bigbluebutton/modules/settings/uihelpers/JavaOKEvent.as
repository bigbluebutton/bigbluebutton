package org.bigbluebutton.modules.settings.uihelpers
{
	import flash.events.Event;

	public class JavaOKEvent extends Event
	{
		public static const JAVA_A_OK:String = "Java is alright, sometimes";
		
		public function JavaOKEvent(type:String)
		{
			super(type, true, false);
		}
	}
}