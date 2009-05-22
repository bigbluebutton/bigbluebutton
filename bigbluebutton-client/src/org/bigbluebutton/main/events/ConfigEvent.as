package org.bigbluebutton.main.events
{
	import flash.events.Event;
	import flash.utils.Dictionary;

	public class ConfigEvent extends Event
	{
		public var numberOfModules:Number;
		public var moduleDescriptors:Dictionary;
		
		public static const CONFIG_LOADED_EVENT:String = 'configLoadedEvent';
		
		public function ConfigEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}