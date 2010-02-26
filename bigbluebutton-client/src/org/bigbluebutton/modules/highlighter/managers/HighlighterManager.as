package org.bigbluebutton.modules.highlighter.managers
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.TimerEvent;
	import flash.utils.Timer;
	
	import org.bigbluebutton.modules.highlighter.views.HighlighterCanvas;
	import org.bigbluebutton.modules.highlighter.views.HighlighterToolbar;
	import org.bigbluebutton.modules.present.events.AddOverlayCanvasEvent;
	import org.bigbluebutton.modules.present.events.AddPresentationToolbarEvent;
	
	public class HighlighterManager
	{
		private var globalDispatcher:Dispatcher;
		//private var highlighterWindow:HighlighterWindow;
		private var highlighterCanvas:HighlighterCanvas;
		private var highlighterToolbar:HighlighterToolbar;
		
		public function HighlighterManager()
		{
			globalDispatcher = new Dispatcher();
		}
		
		public function handleStartModuleEvent():void{	
			if (highlighterCanvas != null) return;
			highlighterCanvas = new HighlighterCanvas();
			if (highlighterToolbar != null) return;
			highlighterToolbar = new HighlighterToolbar();
			highlighterToolbar.canvas = highlighterCanvas;
			
			//Necessary now because of module loading race conditions
			var t:Timer = new Timer(2000, 1);
			t.addEventListener(TimerEvent.TIMER, addHighlighterCanvas);
			t.addEventListener(TimerEvent.TIMER, addHighlighterToolbar);
			t.start();
		}
		
		private function addHighlighterCanvas(e:TimerEvent):void{
			var overlayEvent:AddOverlayCanvasEvent = new AddOverlayCanvasEvent(AddOverlayCanvasEvent.ADD_OVERLAY_CANVAS);
			overlayEvent.canvas = highlighterCanvas;
			globalDispatcher.dispatchEvent(overlayEvent);
		}
		
		private function addHighlighterToolbar(e:TimerEvent):void{
			var toolbarEvent:AddPresentationToolbarEvent = new AddPresentationToolbarEvent(AddPresentationToolbarEvent.ADD_TOOLBAR);
			toolbarEvent.toolbar = highlighterToolbar;
			globalDispatcher.dispatchEvent(toolbarEvent);
		}

	}
}