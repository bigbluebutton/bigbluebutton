package org.bigbluebutton.modules.phone.events
{
	import flash.events.Event;

	public class MicrophoneUnavailEvent extends Event
	{
		public static const MICROPHONE_UNAVAIL_EVENT:String = 'MICROPHONE_UNAVAIL_EVENT';
		
		public function MicrophoneUnavailEvent(bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(MICROPHONE_UNAVAIL_EVENT, bubbles, cancelable);
		}
		
	}
}