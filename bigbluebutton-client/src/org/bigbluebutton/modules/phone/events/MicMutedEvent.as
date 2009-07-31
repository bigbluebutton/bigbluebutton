package org.bigbluebutton.modules.phone.events
{
	import flash.events.Event;

	public class MicMutedEvent extends Event
	{
		public static const MIC_MUTED_EVENT:String = 'MIC_MUTED_EVENT';
		
		public var muted:Boolean = false;
		
		public function MicMutedEvent(bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(MIC_MUTED_EVENT, bubbles, cancelable);
		}
		
	}
}