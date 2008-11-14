package org.bigbluebutton.modules.viewers.view.events
{
	import flash.events.Event;
	
	import org.bigbluebutton.modules.viewers.view.ViewersWindowMediator;

	public class AssignPresenterEvent extends Event
	{
		public static const ASSIGN_PRESENTER_EVENT:String = "ASSIGN_PRESENTER_EVENT";
		
		public var assignTo:Number;
				
		public function AssignPresenterEvent(assignTo:Number)
		{
			super(ASSIGN_PRESENTER_EVENT, false);
			this.assignTo = assignTo;
		}		
	}
}