package org.bigbluebutton.modules.deskShare.events
{
	import flash.events.Event;
	
	import org.bigbluebutton.common.IBigBlueButtonModule;

	public class StartModuleEvent extends Event
	{
		public static const START_MODULE_EVENT:String = "Start Module Event";
		public var module:IBigBlueButtonModule;
		
		public function StartModuleEvent(module:IBigBlueButtonModule, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			this.module = module;
			super(START_MODULE_EVENT, bubbles, cancelable);
		}
		
	}
}