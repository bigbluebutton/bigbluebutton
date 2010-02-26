package org.bigbluebutton.modules.present.events
{
	import flash.events.Event;
	
	import flexlib.containers.DockableToolBar;
	
	public class AddPresentationToolbarEvent extends Event
	{
		public static const ADD_TOOLBAR:String = "ADD_TOOLBAR";
		
		public var toolbar:DockableToolBar;
		
		public function AddPresentationToolbarEvent(type:String)
		{
			super(type, true, false);
		}

	}
}