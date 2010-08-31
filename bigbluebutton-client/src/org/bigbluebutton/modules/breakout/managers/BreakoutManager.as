package org.bigbluebutton.modules.breakout.managers
{
	import com.asfusion.mate.events.Dispatcher;
	
	import org.bigbluebutton.main.events.ToolbarButtonEvent;
	import org.bigbluebutton.modules.breakout.views.BreakoutButton;

	public class BreakoutManager
	{
		private var dispatcher:Dispatcher;
		
		private var button:BreakoutButton;
		
		public function BreakoutManager()
		{
			dispatcher = new Dispatcher();
			button = new BreakoutButton;
		}
		
		public function addButton(attributes:Object):void{
			if (attributes.userrole != "MODERATOR") return;
			var e:ToolbarButtonEvent = new ToolbarButtonEvent(ToolbarButtonEvent.ADD);
			e.button = button;
			dispatcher.dispatchEvent(e);
		}
	}
}