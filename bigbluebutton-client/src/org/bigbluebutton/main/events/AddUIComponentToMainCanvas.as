package org.bigbluebutton.main.events
{
	import flash.events.Event;
	
	import mx.core.UIComponent;
	
	public class AddUIComponentToMainCanvas extends Event
	{
		public static const ADD_COMPONENT:String = "Add_UI_componenet_to_main";
		
		public var component:UIComponent;
		
		public function AddUIComponentToMainCanvas(type:String)
		{
			super(type, true, false);
		}

	}
}