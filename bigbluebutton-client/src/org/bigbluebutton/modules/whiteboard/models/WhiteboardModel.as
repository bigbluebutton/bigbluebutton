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
	import flash.events.EventDispatcher;
	import flash.events.IEventDispatcher;
	
	import mx.collections.ArrayCollection;
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.modules.present.model.Page;
	import org.bigbluebutton.modules.present.model.PresentationModel;
	import org.bigbluebutton.modules.whiteboard.business.shapes.DrawObject;
	import org.bigbluebutton.modules.whiteboard.commands.GetWhiteboardShapesCommand;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardAccessEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardCursorEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardDrawEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardUpdateReceived;

	public class WhiteboardModel extends EventDispatcher
	{
		private static const LOGGER:ILogger = getClassLogger(WhiteboardModel);      
		private var _whiteboards:ArrayCollection = new ArrayCollection();
		
		private var _multiUser:Boolean = false;

    private var _dispatcher:IEventDispatcher;
        
    public function WhiteboardModel(dispatcher:IEventDispatcher) {
      _dispatcher = dispatcher;
    }		
		
    private function getWhiteboard(id:String, requestHistory:Boolean=true):Whiteboard {
      var wb:Whiteboard;
      
      for (var i:int = 0; i < _whiteboards.length; i++) {
        wb = _whiteboards.getItemAt(i) as Whiteboard;
        if (wb.id == id) return wb;
      }
      
      wb = new Whiteboard(id);
      _whiteboards.addItem(wb);
      
      if (requestHistory) {
        _dispatcher.dispatchEvent(new GetWhiteboardShapesCommand(id));
      }
      
      return wb;
    }
    
    public function addAnnotation(annotation:Annotation):void {
      // LOGGER.debug("*** Adding annotation [{0},{1},{2}] ****", [annotation.id, annotation.type, annotation.status]);
      var wb:Whiteboard = getWhiteboard(annotation.whiteboardId);;
      if (annotation.status == AnnotationStatus.DRAW_START || annotation.type == AnnotationType.POLL) {
        wb.addAnnotation(annotation);
      } else {
        wb.updateAnnotation(annotation);
      }
      // LOGGER.debug("*** Dispatching WhiteboardUpdate.BOARD_UPDATED Event ****");
      var event:WhiteboardUpdateReceived = new WhiteboardUpdateReceived(WhiteboardUpdateReceived.NEW_ANNOTATION);
      event.annotation = annotation;
      dispatchEvent(event);
    }
		
    private function addShapes(wb:Whiteboard, shapes:Array):void {
      for (var i:int = 0; i < shapes.length; i++) {
        var an:Annotation = shapes[i] as Annotation;
        wb.addAnnotationAt(an, i);
      }  
    }
    
    
    public function addAnnotationFromHistory(whiteboardId:String, annotation:Array):void {                
      //LOGGER.debug("addAnnotationFromHistory: wb id=[{0}]", [whiteboardId]);
      var wb:Whiteboard = getWhiteboard(whiteboardId, false);
      if (wb != null && !wb.historyLoaded) {
        // LOGGER.debug("Whiteboard is already present. Adding shapes.");
        addShapes(wb, annotation);
        wb.historyLoaded = true;
        
        var e:WhiteboardUpdateReceived = new WhiteboardUpdateReceived(WhiteboardUpdateReceived.RECEIVED_ANNOTATION_HISTORY);
        e.wbId = wb.id;
        dispatchEvent(e);
      }
    }
        
		public function removeAnnotation(wbId:String, shapeId:String):void {
			LOGGER.debug("Removing annotation");
			var wb:Whiteboard = getWhiteboard(wbId);
			if (wb != null) {
				var removedAnnotation:Annotation = wb.undo(shapeId);
				if (removedAnnotation != null) {
					var e:WhiteboardUpdateReceived = new WhiteboardUpdateReceived(WhiteboardUpdateReceived.UNDO_ANNOTATION);
					e.annotation = removedAnnotation;
					dispatchEvent(e);
				}
			}
		}
        
    public function getAnnotations(wbId:String):Array {
      var wb:Whiteboard = getWhiteboard(wbId);
      if (wb != null) {
        return wb.getAnnotations();
      }
      // Just return an empty array.
      return new Array();
    }
		
    public function clear(wbId:String, fullClear:Boolean, userId:String):void {
      LOGGER.debug("Clearing whiteboard");
      var wb:Whiteboard = getWhiteboard(wbId);
      if (wb != null) {
        var event:WhiteboardUpdateReceived = new WhiteboardUpdateReceived(WhiteboardUpdateReceived.CLEAR_ANNOTATIONS);
        event.wbId = wbId;
        if (fullClear) {
          wb.clearAll();
        } else {
          wb.clear(userId);
          event.userId = userId;
        }
        dispatchEvent(event);
      }
    }
    
    public function clearAll():void {
      _whiteboards.removeAll();
      
      var event:WhiteboardUpdateReceived = new WhiteboardUpdateReceived(WhiteboardUpdateReceived.CLEAR_ANNOTATIONS);
      event.wbId = "all";
      dispatchEvent(event);
    }

    public function accessModified(multiUser:Boolean):void {
      _multiUser = multiUser;
      
      var event:WhiteboardAccessEvent = new WhiteboardAccessEvent(WhiteboardAccessEvent.MODIFIED_WHITEBOARD_ACCESS);
      event.multiUser = multiUser;
      dispatchEvent(event);
    }
    
    public function get multiUser():Boolean {
      return _multiUser;
    }
	
    public function updateCursorPosition(userId:String, xPercent:Number, yPercent:Number):void {
      var event:WhiteboardCursorEvent = new WhiteboardCursorEvent(WhiteboardCursorEvent.RECEIVED_CURSOR_POSITION);
      event.userId = userId;
      event.xPercent = xPercent;
      event.yPercent = yPercent;
      dispatchEvent(event);
    }
	
	}
}