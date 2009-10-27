package org.bigbluebutton.modules.deskShare.events
{
	import flash.events.Event;
	
	import org.bigbluebutton.common.IBigBlueButtonModule;

	public class ModuleEvent extends Event
	{
		public static const START:String = "Start Module Event";
		public static const STOP:String = "Stop Module Event";
		
		public var module:IBigBlueButtonModule;
		
		public function ModuleEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			this.module = module;
			super(type, bubbles, cancelable);
		}
		
	}
}