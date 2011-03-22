package org.bigbluebutton.common.events
{
	import flash.events.Event;
	
	import mx.core.UIComponent;
	
	/**
	 * Allows you to add any UIComponent to the main canvas. Simply instantiate the method, add a reference to 
	 * your UIComponent to it, and dispatch the event.
	 * 
	 */	
	public class AddUIComponentToMainCanvas extends Event
	{
		public static const ADD_COMPONENT:String = "Add_UI_componenet_to_main";
		
		/**
		 * The UIComponent to add to the main canvas area of bbb-client. 
		 */		
		public var component:UIComponent;
		
		public function AddUIComponentToMainCanvas(type:String)
		{
			super(type, true, false);
		}

	}
}