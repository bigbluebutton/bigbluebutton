package org.bigbluebutton.modules.present.managers
{
	import com.asfusion.mate.events.Dispatcher;
	
	import mx.managers.PopUpManager;
	
	import org.bigbluebutton.common.IBbbModuleWindow;
	import org.bigbluebutton.main.events.OpenWindowEvent;
	import org.bigbluebutton.modules.present.events.UploadEvent;
	import org.bigbluebutton.modules.present.views.FileUploadWindow;
	import org.bigbluebutton.modules.present.views.PresentationWindow;
	
	public class PresentManager
	{
		private var globalDispatcher:Dispatcher;
		private var uploadWindow:FileUploadWindow;
		private var presentWindow:PresentationWindow;
		
		//format: presentationNames = [{label:"00"}, {label:"11"}, {label:"22"} ];
		[Bindable] public var presentationNames:Array = new Array();
		
		public function PresentManager()
		{
			globalDispatcher = new Dispatcher();
		}
		
		public function handleStartModuleEvent():void{
			if (presentWindow != null) return;
			presentWindow = new PresentationWindow();
			openWindow(presentWindow);
		}
		
		public function handleStopModuleEvent():void{
			
		}
		
		private function openWindow(window:IBbbModuleWindow):void{				
			var event:OpenWindowEvent = new OpenWindowEvent(OpenWindowEvent.OPEN_WINDOW_EVENT);
			event.window = window;
			globalDispatcher.dispatchEvent(event);
		}
		
		public function handleOpenUploadWindow(e:UploadEvent):void{
			if (uploadWindow != null) return;
			
			uploadWindow = new FileUploadWindow();
			uploadWindow.presentationNames = presentationNames;
			mx.managers.PopUpManager.addPopUp(uploadWindow, presentWindow, false);
		}
		
		public function handleCloseUploadWindow():void{
			PopUpManager.removePopUp(uploadWindow);
			uploadWindow = null;
		}
		
		public function updatePresentationNames(e:UploadEvent):void{
			presentationNames.push({label:String(e.presentationName)});
		}

	}
}