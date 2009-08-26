package org.blindside.modules.autotest.events
{
	import flash.events.Event;
	
	public class SOTestEvent extends Event
	{
		public static const TEST_SHARED_OBJECT_CONNECTION:String = "testSOConnectionEvent";
		
		public function SOTestEvent(type:String = TEST_SHARED_OBJECT_CONNECTION)
		{
			super(type, false, false);
		}

	}
}