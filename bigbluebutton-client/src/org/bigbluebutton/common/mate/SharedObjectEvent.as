package org.bigbluebutton.common.mate
{
	import flash.events.Event;
	
	/**
	 * Represents an event sent by the SharedObjectService 
	 * @author Snap
	 * 
	 */	
	public class SharedObjectEvent extends Event
	{
		public static const SHARED_OBJECT_UPDATE_SUCCESS:String = "sharedObjectUpdateSuccess";
		public static const SHARED_OBJECT_UPDATE_FAILED:String = "sharedObjectUpdateFailed";
		
		public var message:Object;
		
		public function SharedObjectEvent(type:String, bubbles:Boolean = true, cancelable:Boolean = false)
		{
			super(type, bubbles, cancelable);
		}

	}
}