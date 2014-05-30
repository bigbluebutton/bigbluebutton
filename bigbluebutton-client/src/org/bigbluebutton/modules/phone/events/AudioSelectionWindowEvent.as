package org.bigbluebutton.modules.phone.events
{
	import flash.events.Event;
	
	public class AudioSelectionWindowEvent extends Event
	{
		public static const SHOW_AUDIO_SELECTION:String = 'SHOW_AUDIO_SELECTION';
		public static const CLOSED_AUDIO_SELECTION:String = 'CLOSED_AUDIO_SELECTION';
		
		public function AudioSelectionWindowEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
	}
}