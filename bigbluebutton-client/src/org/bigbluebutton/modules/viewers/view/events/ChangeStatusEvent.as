package org.bigbluebutton.modules.viewers.view.events
{
	import flash.events.Event;
	
	import mx.collections.ArrayCollection;

	public class ChangeStatusEvent extends Event
	{
		public static const CHANGE_STATUS_EVENT:String = "CHANGE_STATUS_EVENT";
		
		public var status:ArrayCollection;
		
		public function ChangeStatusEvent(status:ArrayCollection)
		{
			super(CHANGE_STATUS_EVENT);
			this.status = status;
		}
		
	}
}