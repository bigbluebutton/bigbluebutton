package org.bigbluebutton.modules.listeners.managers
{
	import com.asfusion.mate.events.Dispatcher;
	
	import org.bigbluebutton.main.events.OpenWindowEvent;
	import org.bigbluebutton.modules.listeners.events.StartListenersModuleEvent;
	import org.bigbluebutton.modules.listeners.views.ListenersWindow;

	public class ListenersManager
	{
		
		private var dispatcher:Dispatcher;
		private var listenersWindow:ListenersWindow;
		
		public function ListenersManager(){
			dispatcher = new Dispatcher();
		}
		
		public function moduleStarted(event:StartListenersModuleEvent):void{
			if (listenersWindow == null){
				listenersWindow = new ListenersWindow();
				var e:OpenWindowEvent = new OpenWindowEvent(OpenWindowEvent.OPEN_WINDOW_EVENT);
				e.window = listenersWindow;
				dispatcher.dispatchEvent(e);
			}
		}
		
		public function moduleEnded():void{
			
		}
	}
}