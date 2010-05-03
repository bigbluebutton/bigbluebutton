package org.bigbluebutton.modules.highlighter.managers
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.TimerEvent;
	import flash.utils.Timer;
	
	import org.bigbluebutton.main.events.AddUIComponentToMainCanvas;
	import org.bigbluebutton.modules.highlighter.events.WhiteboardButtonEvent;
	import org.bigbluebutton.modules.highlighter.views.HighlighterCanvas;
	import org.bigbluebutton.modules.highlighter.views.HighlighterToolbar;
	import org.bigbluebutton.modules.highlighter.views.WhiteboardButton;
	import org.bigbluebutton.modules.present.events.AddButtonToPresentationEvent;
	import org.bigbluebutton.modules.present.events.AddOverlayCanvasEvent;
	
	public class HighlighterManager
	{
		private var globalDispatcher:Dispatcher;
		private var highlighterCanvas:HighlighterCanvas;
		private var highlighterToolbar:HighlighterToolbar;
		private var whiteboardButton:WhiteboardButton;
		
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
			if (whiteboardButton != null) return;
			whiteboardButton = new WhiteboardButton();
			
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
			//var toolbarEvent:AddPresentationToolbarEvent = new AddPresentationToolbarEvent(AddPresentationToolbarEvent.ADD_TOOLBAR);
			//toolbarEvent.toolbar = highlighterToolbar;
			//globalDispatcher.dispatchEvent(toolbarEvent);
			var buttonEvent:AddButtonToPresentationEvent = new AddButtonToPresentationEvent(AddButtonToPresentationEvent.ADD_BUTTON);
			buttonEvent.button = whiteboardButton;
			globalDispatcher.dispatchEvent(buttonEvent);
		}
		
		public function positionToolbar(e:WhiteboardButtonEvent):void{
			var addUIEvent:AddUIComponentToMainCanvas = new AddUIComponentToMainCanvas(AddUIComponentToMainCanvas.ADD_COMPONENT);
			addUIEvent.component = highlighterToolbar;
			globalDispatcher.dispatchEvent(addUIEvent);
			highlighterToolbar.positionToolbar(e.window);
		}

	}
}