package org.bigbluebutton.modules.deskShare.maps
{
	import com.asfusion.mate.events.Dispatcher;
	
	import org.bigbluebutton.common.IBbbModuleWindow;
	import org.bigbluebutton.main.events.CloseWindowEvent;
	import org.bigbluebutton.main.events.MadePresenterEvent;
	import org.bigbluebutton.main.events.OpenWindowEvent;
	import org.bigbluebutton.main.events.ToolbarButtonEvent;
	import org.bigbluebutton.modules.deskShare.services.DeskshareService;
	import org.bigbluebutton.modules.deskShare.view.components.DesktopPublishWindow;
	import org.bigbluebutton.modules.deskShare.view.components.DesktopViewWindow;
	import org.bigbluebutton.modules.deskShare.view.components.ToolbarButton;
			
	public class DeskshareEventMapDelegate
	{		
		private var window:IBbbModuleWindow;
		private var button:ToolbarButton;
		private var module:DeskShareModule;
		private var service:DeskshareService;
		private var isSharing:Boolean = false;
		private var isViewing:Boolean = false;
		private var globalDispatcher:Dispatcher;
		
		public function DeskshareEventMapDelegate()
		{
			service = new DeskshareService();
			globalDispatcher = new Dispatcher();
		}
		
		public function startModule(module:DeskShareModule):void {
			LogUtil.debug("Deskshare Module starting");
			this.module = module;			
			service.connect(module.uri);
		}
		
		public function stopModule():void {
			LogUtil.debug("Deskshare Module stopping");
			sendStopViewingCommand();			
			service.disconnect();
		}
			
		public function sendStartViewingCommand(videoWidth:Number, videoHeight:Number):void{
			LogUtil.debug("Sending startViewing command");
			isSharing = true;
			button.enabled = false;
			service.sendStartViewingNotification(videoWidth, videoHeight);
		}
			
		public function sendStopViewingCommand():void {
			LogUtil.debug("sendStopViewingCommand()");
			if (isSharing) {
				button.enabled = true;
				service.sendStopViewingNotification();
				isSharing = false;
			}			
			resetWindow();
		}
						
		private function addToolbarButton():void {
			LogUtil.debug("DeskShare::addToolbarButton");
			button = new ToolbarButton();
			   	
		   	// Use the GLobal Dispatcher so that this message will be heard by the
		   	// main application.		   	
			var event:ToolbarButtonEvent = new ToolbarButtonEvent(ToolbarButtonEvent.ADD);
			event.button = button;
			globalDispatcher.dispatchEvent(event);
		}
			
		private function removeToolbarButton():void {
			var event:ToolbarButtonEvent = new ToolbarButtonEvent(ToolbarButtonEvent.REMOVE);
			event.button = button;
			globalDispatcher.dispatchEvent(event);
		}
			
		public function showToolbarButton(e:MadePresenterEvent):void{
			LogUtil.debug("Got MadePresenterEvent " + e.presenter);
			if (e.presenter) {
				addToolbarButton();
			} else {
				removeToolbarButton();
			}
		}
		
		public function startSharing():void {
			openDeskShareWindow();
		}
		
		private function openDeskShareWindow():void{
			LogUtil.debug("opening desk share window");
			window = new DesktopPublishWindow();
			var pubWindow:DesktopPublishWindow = window as DesktopPublishWindow;
			pubWindow.xPosition = 675;
			pubWindow.yPosition = 310;
			pubWindow.startSharing(service.getConnection(), module.getCaptureServerUri(), module.getRoom());
				
			var e:OpenWindowEvent = new OpenWindowEvent(OpenWindowEvent.OPEN_WINDOW_EVENT);
			e.window = window;
			globalDispatcher.dispatchEvent(e);
		}
			
		public function stopViewing():void {
			LogUtil.debug("Received stop viewing command");
			if (isViewing) {				
				var viewWindow:DesktopViewWindow = window as DesktopViewWindow;
				viewWindow.stopViewing();
				viewWindow.close();
				resetWindow();	
				isViewing = false;			
			}
		}
		
		private function resetWindow():void {
			var event:CloseWindowEvent = new CloseWindowEvent(CloseWindowEvent.CLOSE_WINDOW_EVENT);
			event.window = window;
			globalDispatcher.dispatchEvent(event);
			window = null;
		}
			
		public function startViewing(videoWidth:Number, videoHeight:Number):void{
			LogUtil.debug("Received start vieweing command");
			if (isSharing) {
				LogUtil.debug("We are the one sharing, so ignore this message");
				return;
			} 
			LogUtil.debug("DeskShareEventsMap::startViewing");
			
			isViewing = true;
				
			window = new DesktopViewWindow();
			var viewWindow:DesktopViewWindow = window as DesktopViewWindow;
			viewWindow.startVideo(service.getConnection(), module.getRoom(), videoWidth, videoHeight);
			
			var windowEvent:OpenWindowEvent = new OpenWindowEvent(OpenWindowEvent.OPEN_WINDOW_EVENT);
			windowEvent.window = window;
			globalDispatcher.dispatchEvent(windowEvent);
		}
	}
}