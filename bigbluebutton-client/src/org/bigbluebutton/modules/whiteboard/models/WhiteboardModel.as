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
package org.bigbluebutton.modules.whiteboard.models
{
	import flash.events.IEventDispatcher;
	
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.modules.present.model.Page;
	import org.bigbluebutton.modules.present.model.PresentationModel;
	import org.bigbluebutton.modules.whiteboard.business.shapes.DrawObject;
	import org.bigbluebutton.modules.whiteboard.business.shapes.TextObject;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardDrawEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardShapesEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardUpdate;

	public class WhiteboardModel
	{
    private static const LOG:String = "WB::WhiteboardModel - ";    
		private var _whiteboards:ArrayCollection = new ArrayCollection();

    private var _dispatcher:IEventDispatcher;
        
    public function WhiteboardModel(dispatcher:IEventDispatcher) {
      _dispatcher = dispatcher;
    }		
		
    private function getWhiteboard(id:String):Whiteboard {
       for (var i:int = 0; i < _whiteboards.length; i++) {
         var wb:Whiteboard = _whiteboards.getItemAt(i) as Whiteboard;
         if (wb.id == id) return wb;
       }
       return null;
    }
    
		public function addAnnotation(annotation:Annotation):void {
      trace(LOG + "*** Adding annotation [" + annotation.id + "," + annotation.type + "," + annotation.status + "] ****");
      var wb:Whiteboard;
      if (annotation.status == DrawObject.DRAW_START || annotation.status == TextObject.TEXT_CREATED) {
        wb = getWhiteboard(annotation.whiteboardId);
        if (wb != null) {
          wb.addAnnotation(annotation);
        } else {
          wb = new Whiteboard(annotation.whiteboardId);
          wb.addAnnotation(annotation);
          _whiteboards.addItem(wb);
        }         
       } else {
         wb = getWhiteboard(annotation.whiteboardId);
         if (wb != null) {
           wb.updateAnnotation(annotation);
         }
       }
			 
       trace(LOG + "*** Dispatching WhiteboardUpdate.BOARD_UPDATED Event ****");
       var event:WhiteboardUpdate = new WhiteboardUpdate(WhiteboardUpdate.BOARD_UPDATED);
       event.annotation = annotation;
       _dispatcher.dispatchEvent(event);
//       trace(LOG + "*** Dispatched WhiteboardUpdate.BOARD_UPDATED Event ****");
		}
		
    private function addShapes(wb:Whiteboard, shapes:Array):void {
      for (var i:int = 0; i < shapes.length; i++) {
        var an:Annotation = shapes[i] as Annotation;
        wb.addAnnotation(an);
      }  
    }
    
    
    public function addAnnotationFromHistory(whiteboardId:String, annotation:Array):void {                
      trace(LOG + "addAnnotationFromHistory: wb id=[" + whiteboardId + "]");
      var wb:Whiteboard = getWhiteboard(whiteboardId);
      if (wb != null) {
        trace(LOG + "Whiteboard is already present. Adding shapes.");
        addShapes(wb, annotation);
      } else {
        trace(LOG + "Whiteboard is NOT present. Creating WB and adding shapes.");
        wb = new Whiteboard(whiteboardId);
        addShapes(wb, annotation);
        _whiteboards.addItem(wb);
      } 

      _dispatcher.dispatchEvent(new WhiteboardShapesEvent(wb.id));
    }
        
		public function removeAnnotation(id:String):void {
			
		}
		
    public function getAnnotation(id:String):Annotation {
      var wbId:String = getCurrentWhiteboardId();
      if (wbId != null) {
        var wb:Whiteboard = getWhiteboard(wbId);
        if (wb != null) {
          return wb.getAnnotation(id);
        }        
      }
      return null;
    }
        
    public function getAnnotations(wbId:String):Array {
      var wb:Whiteboard = getWhiteboard(wbId);
      if (wb != null) {
        return wb.getAnnotations();
      }
      // Just return an empty array.
      return new Array();
    }
        
		public function undo(wbId:String):void {
      trace(LOG + "Undoing whiteboard");
      var wb:Whiteboard = getWhiteboard(wbId);
      if (wb != null) {
        wb.undo();
        _dispatcher.dispatchEvent(new WhiteboardUpdate(WhiteboardUpdate.UNDO_ANNOTATION));
      }
      
		}
		
		public function clear(wbId:String):void {
      trace(LOG + "Clearing whiteboard");
      var wb:Whiteboard = getWhiteboard(wbId);
      if (wb != null) {
        wb.clear();
        _dispatcher.dispatchEvent(new WhiteboardUpdate(WhiteboardUpdate.CLEAR_ANNOTATIONS));
      }
      
    }


		public function enable(enabled:Boolean):void {
			
		}
        
      
    public function getCurrentWhiteboardId():String {
      var page:Page = PresentationModel.getInstance().getCurrentPage();
      if (page != null) {
        return page.id;
      }
      
      return null;
    }
    

	}
}