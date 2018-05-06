package org.bigbluebutton.modules.phone.events
{
	import flash.events.Event;
	
	public class AudioSelectionWindowEvent extends Event
	{
		public static const SHOW_AUDIO_SELECTION:String = 'SHOW_AUDIO_SELECTION';
		public static const CLOSED_AUDIO_SELECTION:String = 'CLOSED_AUDIO_SELECTION';
		
		public var closedWithoutJoin:Boolean = false;
		
		public function AudioSelectionWindowEvent(type:String, closedWithoutJoin:Boolean=false)
		{
			super(type, false, false);
			this.closedWithoutJoin = closedWithoutJoin;
		}
	}
}