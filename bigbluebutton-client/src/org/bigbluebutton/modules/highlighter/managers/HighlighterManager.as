package org.bigbluebutton.modules.highlighter.managers
{
	import com.asfusion.mate.events.Dispatcher;
	
	import org.bigbluebutton.common.IBbbModuleWindow;
	import org.bigbluebutton.main.events.OpenWindowEvent;
	import org.bigbluebutton.modules.highlighter.views.HighlighterWindow;
	
	public class HighlighterManager
	{
		private var globalDispatcher:Dispatcher;
		private var highlighterWindow:HighlighterWindow;
		
		public function HighlighterManager()
		{
			globalDispatcher = new Dispatcher();
		}
		
		public function handleStartModuleEvent():void{
			if (highlighterWindow != null) return;
			highlighterWindow = new HighlighterWindow();
			openWindow(highlighterWindow);
		}
		
		private function openWindow(window:IBbbModuleWindow):void{		
			var event:OpenWindowEvent = new OpenWindowEvent(OpenWindowEvent.OPEN_WINDOW_EVENT);
			event.window = window;
			globalDispatcher.dispatchEvent(event);
		}

	}
}