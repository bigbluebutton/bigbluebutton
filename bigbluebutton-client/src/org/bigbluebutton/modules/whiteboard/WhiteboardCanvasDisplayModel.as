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
package org.bigbluebutton.modules.whiteboard
{
  import flash.display.DisplayObject;
  
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.core.model.LiveMeeting;
  import org.bigbluebutton.modules.whiteboard.business.shapes.GraphicObject;
  import org.bigbluebutton.modules.whiteboard.business.shapes.ShapeFactory;
  import org.bigbluebutton.modules.whiteboard.business.shapes.TextObject;
  import org.bigbluebutton.modules.whiteboard.business.shapes.WhiteboardConstants;
  import org.bigbluebutton.modules.whiteboard.models.Annotation;
  import org.bigbluebutton.modules.whiteboard.models.AnnotationStatus;
  import org.bigbluebutton.modules.whiteboard.models.AnnotationType;
  import org.bigbluebutton.modules.whiteboard.models.WhiteboardModel;
  import org.bigbluebutton.modules.whiteboard.views.TextUpdateListener;
  import org.bigbluebutton.modules.whiteboard.views.WhiteboardCanvas;
  import org.bigbluebutton.modules.whiteboard.views.WhiteboardCursor;
  
    /**
    * Class to handle displaying of received annotations from the server.
    */
  public class WhiteboardCanvasDisplayModel {
	private static const LOGGER:ILogger = getClassLogger(WhiteboardCanvasDisplayModel);
    
    private var whiteboardModel:WhiteboardModel;
    private var wbCanvas:WhiteboardCanvas;  
    private var _annotationsMap:Object = new Object();
	private var _cursors:Object = new Object();
    private var shapeFactory:ShapeFactory = new ShapeFactory();
    private var textUpdateListener:TextUpdateListener = new TextUpdateListener();
    
    private var width:Number;
    private var height:Number;
	private var presenterId:String;
	private var multiUser:Boolean = false;
	
	public function setDependencies(whiteboardCanvas:WhiteboardCanvas, whiteboardModel:WhiteboardModel):void {
		wbCanvas = whiteboardCanvas;
		this.whiteboardModel = whiteboardModel;
		
		textUpdateListener.setDependencies(wbCanvas, shapeFactory);
	}
	
	public function isEditingText():Boolean {
		return textUpdateListener.isEditingText();
	}
	
    public function doMouseDown(mouseX:Number, mouseY:Number):void {
      if (textUpdateListener) textUpdateListener.canvasMouseDown();
    }
    
    public function drawGraphic(o:Annotation):void {
      //  LogUtil.debug("**** Drawing graphic [" + o.type + "] *****");
      var gobj:GraphicObject;
      switch (o.status) {
        case AnnotationStatus.DRAW_START:
          createGraphic(o, false);
          break;
        case AnnotationStatus.DRAW_UPDATE:
        case AnnotationStatus.DRAW_END:
          if (_annotationsMap.propertyIsEnumerable(o.id)) {
            (_annotationsMap[o.id] as GraphicObject).updateAnnotation(o);
          } else {
            createGraphic(o, false);
          }
          break;
      }
    }
    
    private function createGraphic(o:Annotation, fromHistory:Boolean):void {
      var gobj:GraphicObject = shapeFactory.makeGraphicObject(o);
      if (gobj != null) {
        gobj.draw(o, shapeFactory.parentWidth, shapeFactory.parentHeight);
        wbCanvas.addGraphic(gobj as DisplayObject);
        _annotationsMap[gobj.id] = gobj;
        
        if (!fromHistory &&
            o.type == AnnotationType.TEXT &&
            o.status != AnnotationStatus.DRAW_END &&
            o.userId == UsersUtil.getMyUserID()) {
          textUpdateListener.newTextObject(gobj as TextObject);
        }
      }
    }
    
    private function removeGraphic(id:String):void {
      if (_annotationsMap.propertyIsEnumerable(id)) {
        var gobjToRemove:GraphicObject = _annotationsMap[id] as GraphicObject;
        wbCanvas.removeGraphic(gobjToRemove as DisplayObject);
        delete _annotationsMap[id];
        
        if (gobjToRemove.toolType == WhiteboardConstants.TYPE_TEXT) {
          textUpdateListener.removedTextObject(gobjToRemove as TextObject);
        }
      }
    }
    
    public function clearBoard(userId:String=null):void {
      var gobj:GraphicObject;
      
      if (userId) {
        for each (gobj in _annotationsMap){
          if (gobj.userId == userId) {
            removeGraphic(gobj.id);
          }
        }
      } else {
        _annotationsMap = new Object();
        wbCanvas.removeAllGraphics();
      }
    }
    
    public function clearCursors():void {
      _cursors = new Object();
      wbCanvas.removeAllCursors();
    }
    
    public function undoAnnotation(annotation:Annotation):void {
      removeGraphic(annotation.id);
    }
        
    public function receivedAnnotationsHistory(wbId:String):void {
      var annotations:Array = whiteboardModel.getAnnotations(wbId);
      for (var i:int = 0; i < annotations.length; i++) {
        createGraphic(annotations[i], true);
      }
	}
        
    public function changeWhiteboard(wbId:String):void{
      textUpdateListener.canvasMouseDown();
      
      //LogUtil.debug("**** CanvasDisplay changePage. Clearing page *****");
      clearBoard();
      clearCursors();
      
      var annotations:Array = whiteboardModel.getAnnotations(wbId);
      //LogUtil.debug("**** CanvasDisplay changePage [" + annotations.length + "] *****");
      for (var i:int = 0; i < annotations.length; i++) {
        createGraphic(annotations[i], true);
      }
    }
	
	public function multiUserChange(multiUser:Boolean):void {
		this.multiUser = multiUser;
		
		for each(var cursor:WhiteboardCursor in _cursors) {
			cursor.updateMultiUser(multiUser);
		}
	}
    
		public function drawCursor(userId:String, xPercent:Number, yPercent:Number):void {
			if (!_cursors.hasOwnProperty(userId)) {
				var userName:String = UsersUtil.getUserName(userId);
				if (userName) {
					var newCursor:WhiteboardCursor = new WhiteboardCursor(userId, userName, 
							xPercent, yPercent, shapeFactory.parentWidth, 
							shapeFactory.parentHeight, presenterId == userId, multiUser);
					wbCanvas.addCursor(newCursor);
					
					_cursors[userId] = newCursor;
				}
			} else {
				(_cursors[userId] as WhiteboardCursor).updatePosition(xPercent, yPercent);
			}
		}
		
		public function presenterChange(amIPresenter:Boolean, presenterId:String):void {
			this.presenterId = presenterId;

			for each(var cursor:WhiteboardCursor in _cursors) {
				cursor.updatePresenter(presenterId);
			}
		}
		
		public function userLeft(userId:String):void {
			if (_cursors.hasOwnProperty(userId)) {
				wbCanvas.removeCursorChild(_cursors[userId]);
				delete _cursors[userId];
			}
		}
    
    public function zoomCanvas(width:Number, height:Number):void {
      shapeFactory.setParentDim(width, height);  
      this.width = width;
      this.height = height;

      for each (var gobj:GraphicObject in _annotationsMap) {
        gobj.redraw(shapeFactory.parentWidth, shapeFactory.parentHeight);
      }
      
      for(var j:String in _cursors) {
        (_cursors[j] as WhiteboardCursor).updateParentSize(width, height);
      }
    }
  }
}
