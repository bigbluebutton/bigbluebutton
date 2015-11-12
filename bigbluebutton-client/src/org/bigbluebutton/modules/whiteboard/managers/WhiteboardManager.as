/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/
package org.bigbluebutton.modules.whiteboard.managers
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.TimerEvent;
	import flash.utils.Timer;
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.common.events.AddUIComponentToMainCanvas;
	import org.bigbluebutton.modules.present.api.PresentationAPI;
	import org.bigbluebutton.modules.present.events.PageLoadedEvent;
	import org.bigbluebutton.modules.whiteboard.WhiteboardCanvasDisplayModel;
	import org.bigbluebutton.modules.whiteboard.WhiteboardCanvasModel;
	import org.bigbluebutton.modules.whiteboard.events.ToggleGridEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardButtonEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardShapesEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardUpdate;
	import org.bigbluebutton.modules.whiteboard.models.WhiteboardModel;
	import org.bigbluebutton.modules.whiteboard.views.WhiteboardCanvas;
	import org.bigbluebutton.modules.whiteboard.views.WhiteboardTextToolbar;
	import org.bigbluebutton.modules.whiteboard.views.WhiteboardToolbar;
	
	public class WhiteboardManager
	{
	private static const LOGGER:ILogger = getClassLogger(WhiteboardManager);      
    
    /* Injected by Mate */
    public var whiteboardModel:WhiteboardModel;
        
		private var globalDispatcher:Dispatcher;
		private var highlighterCanvas:WhiteboardCanvas;
		private var highlighterToolbar:WhiteboardToolbar;
		private var textToolbar:WhiteboardTextToolbar;

		private var model:WhiteboardCanvasModel = new WhiteboardCanvasModel();
		private var displayModel:WhiteboardCanvasDisplayModel = new WhiteboardCanvasDisplayModel();
        
		public function WhiteboardManager() {
			globalDispatcher = new Dispatcher();
		}
		
		public function handleStartModuleEvent():void {	
			if (highlighterCanvas != null) return;
            
			highlighterCanvas = new WhiteboardCanvas();
			highlighterCanvas.model = model;
      highlighterCanvas.displayModel = displayModel;
      displayModel.whiteboardModel = whiteboardModel;
      model.whiteboardModel = whiteboardModel
                
		  model.wbCanvas = highlighterCanvas;
      displayModel.wbCanvas = highlighterCanvas;
            
			if (highlighterToolbar != null) return;
            
			highlighterToolbar = new WhiteboardToolbar();
			highlighterToolbar.canvas = highlighterCanvas;
            
			if (textToolbar != null) return;
            
			textToolbar = new WhiteboardTextToolbar();
			textToolbar.canvas = highlighterCanvas;
			textToolbar.init();
			highlighterCanvas.textToolbar = textToolbar;
            
			//Necessary now because of module loading race conditions
			var t:Timer = new Timer(1000, 1);
			t.addEventListener(TimerEvent.TIMER, addHighlighterCanvas);
			t.start();
		}
		
		private function addHighlighterCanvas(e:TimerEvent):void {
      		LOGGER.debug("Adding Whiteboard Overlay Canvas");
			PresentationAPI.getInstance().addOverlayCanvas(highlighterCanvas);
		}	

		public function positionToolbar(e:WhiteboardButtonEvent):void {
			// add text toolbar for allowing customization of text	
			var addUIEvent:AddUIComponentToMainCanvas = new AddUIComponentToMainCanvas(AddUIComponentToMainCanvas.ADD_COMPONENT);
			addUIEvent.component = highlighterToolbar;
			globalDispatcher.dispatchEvent(addUIEvent);
			highlighterToolbar.positionToolbar(e.window);
			highlighterToolbar.stage.focus = highlighterToolbar;
			
			var addTextToolbarEvent:AddUIComponentToMainCanvas = new AddUIComponentToMainCanvas(AddUIComponentToMainCanvas.ADD_COMPONENT);
			addTextToolbarEvent.component = textToolbar;
			globalDispatcher.dispatchEvent(addTextToolbarEvent);
			textToolbar.positionToolbar(e.window);
		}

		public function drawGraphic(event:WhiteboardUpdate):void {
			if (event.annotation.whiteboardId == whiteboardModel.getCurrentWhiteboardId()) {
				displayModel.drawGraphic(event);
			}
		}
		
		public function clearAnnotations():void {
      displayModel.clearBoard();
		}
        
    public function receivedAnnotationsHistory(event:WhiteboardShapesEvent):void {
      displayModel.receivedAnnotationsHistory(event.whiteboardId);
    }
		
		public function undoAnnotation(event:WhiteboardUpdate):void {
      displayModel.undoAnnotation(event.annotationID);
		}
		
		public function toggleGrid(event:ToggleGridEvent = null):void {
	//		model.toggleGrid();
		}
			
		public function enableWhiteboard(e:WhiteboardButtonEvent):void {
			highlighterCanvas.enableWhiteboard(e);
		}
		
		public function disableWhiteboard(e:WhiteboardButtonEvent):void {
			highlighterCanvas.disableWhiteboard(e);
		}
    
    public function handlePageChangedEvent(e:PageLoadedEvent):void {
      displayModel.changePage(e.pageId);
    }

    public function removeAnnotationsHistory():void {
      // it will dispatch the cleanAnnotations in the displayModel later
      whiteboardModel.clear();
    }
	}
}
