package org.bigbluebutton.modules.viewers.managers
{
	import com.asfusion.mate.events.Dispatcher;
	
	import mx.controls.Alert;
	
	import org.bigbluebutton.main.events.CloseWindowEvent;
	import org.bigbluebutton.main.events.OpenWindowEvent;
	import org.bigbluebutton.modules.viewers.events.LoginSuccessEvent;
	import org.bigbluebutton.modules.viewers.events.ViewersModuleEndEvent;
	import org.bigbluebutton.modules.viewers.events.ViewersModuleStartedEvent;
	import org.bigbluebutton.modules.viewers.views.ViewersWindow;

	public class ViewersManager
	{
		private var viewersWindow:ViewersWindow;
		private var dispatcher:Dispatcher;
		
		private var _module:ViewersModule;
		
		public function ViewersManager(){
			dispatcher = new Dispatcher();
		}
		
		public function moduleStarted(e:ViewersModuleStartedEvent):void{
			_module = e.module;
			
			if (viewersWindow == null){
				viewersWindow = new ViewersWindow();
				var windowEvent:OpenWindowEvent = new OpenWindowEvent(OpenWindowEvent.OPEN_WINDOW_EVENT);
				windowEvent.window = viewersWindow;
				dispatcher.dispatchEvent(windowEvent);
			}
		}
		
		public function moduleEnded(e:ViewersModuleEndEvent):void{
			var event:CloseWindowEvent = new CloseWindowEvent(CloseWindowEvent.CLOSE_WINDOW_EVENT);
			event.window = viewersWindow;
			dispatcher.dispatchEvent(event);
		}
	}
}