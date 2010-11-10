package org.bigbluebutton.playback.events
{
	import flash.events.Event;
	
	public class ConfigEvent extends Event
	{
		public static const CONFIG_EVENT:String="getConfigEvent";
		
		public var directory:String;
		public var file:String;
		
		public function ConfigEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
	}
}