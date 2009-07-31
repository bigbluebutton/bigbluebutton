package org.bigbluebutton.modules.phone.events
{
	import flash.events.Event;

	public class JoinVoiceConferenceEvent extends Event
	{
		
		public static const JOIN_VOICE_CONFERENCE_EVENT:String = 'JOIN_VOICE_CONFERENCE_EVENT';
		
		public function JoinVoiceConferenceEvent(bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(JOIN_VOICE_CONFERENCE_EVENT, bubbles, cancelable);
		}
		
	}
}