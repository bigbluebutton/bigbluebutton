package org.bigbluebutton.modules.viewers.view.events
{
	import flash.events.Event;

	public class ChangeRoleEvent extends Event
	{
		public static const CHANGE_PRESENTER_EVENT:String = "CHANGE_PRESENTER_EVENT";
		
		public var assignTo:Number;
		
		public function ChangeRoleEvent(assignTo:Number)
		{
			super(CHANGE_PRESENTER_EVENT);
			this.assignTo = assignTo;
		}
		
	}
}