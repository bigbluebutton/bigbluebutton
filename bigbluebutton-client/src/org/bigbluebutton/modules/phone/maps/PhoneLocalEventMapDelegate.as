package org.bigbluebutton.modules.phone.maps
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.IEventDispatcher;
	
	import org.bigbluebutton.main.events.AddToolbarButtonEvent;
	import org.bigbluebutton.main.events.CloseWindowEvent;
	import org.bigbluebutton.main.events.RemoveToolbarButtonEvent;
	import org.bigbluebutton.modules.phone.views.components.ToolbarButton;
	
	public class PhoneLocalEventMapDelegate
	{
		private var dispatcher:IEventDispatcher;

		private var phoneButton:ToolbarButton;
		private var buttonOpen:Boolean = false;
		private var globalDispatcher:Dispatcher;
				
		public function PhoneLocalEventMapDelegate(dispatcher:IEventDispatcher)
		{
			this.dispatcher = dispatcher;
			phoneButton = new ToolbarButton();
			globalDispatcher = new Dispatcher();
		}

		public function addToolbarButton():void {
		   	// Set the local dispatcher for this window so that it can send messages
		   	// that can be heard by the LocalEventMap.
		   	phoneButton.setLocalDispatcher(dispatcher);
		   	
		   	// Use the GLobal Dispatcher so that this message will be heard by the
		   	// main application.		   	
			var event:AddToolbarButtonEvent = new AddToolbarButtonEvent(AddToolbarButtonEvent.ADD_TOOLBAR_BUTTON_EVENT);
			event.button = phoneButton;
			trace("Dispatching ADD TOOLBAR BUTTON EVENT");
			globalDispatcher.dispatchEvent(event);
		   	
		   	buttonOpen = true;

		}
		
		public function removeToolbarButton():void {
			var event:RemoveToolbarButtonEvent = new RemoveToolbarButtonEvent(RemoveToolbarButtonEvent.REMOVE_TOOLBAR_BUTTON_EVENT);
			event.button = phoneButton;
			trace("Dispatching REMOVE TOOLBAR BUTTON EVENT");
			globalDispatcher.dispatchEvent(event);
		   	
		   	buttonOpen = false;
		}
		
		public function disableToolbarButton():void {
			phoneButton.enabled = false;
		}
		
		public function enableToolbarButton():void {
			phoneButton.enabled = true;
		}
	}
}