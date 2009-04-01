package org.bigbluebutton.modules.viewers.view.events
{
	import flash.events.Event;

	public class AssignPresenterEvent extends Event
	{
		public static const ASSIGN_PRESENTER_EVENT:String = "ASSIGN_PRESENTER_EVENT";
		
		public var assignTo:Number;
		public var name:String;
				
		public function AssignPresenterEvent(assignTo:Number, name:String)
		{
			super(ASSIGN_PRESENTER_EVENT, false);
			this.assignTo = assignTo;
			this.name = name;
		}		
	}
}