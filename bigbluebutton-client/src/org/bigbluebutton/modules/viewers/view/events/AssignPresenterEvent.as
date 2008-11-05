package org.bigbluebutton.modules.viewers.view.events
{
	import flash.events.Event;
	
	import org.bigbluebutton.modules.viewers.view.ViewersWindowMediator;

	public class AssignPresenterEvent extends Event
	{
		public var assignTo:Number;
		//public static const ASSIGN_PRESENTER_EVENT:String = "ASSIGN_PRESENTER_EVENT";
		
		public function AssignPresenterEvent(assignTo:Number)
		{
			super(ViewersWindowMediator.ASSIGN_PRESENTER_EVENT, true);
			this.assignTo = assignTo;
		}
		
	}
}