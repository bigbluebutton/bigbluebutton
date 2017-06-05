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
  import flash.events.Event;
  import flash.events.FocusEvent;
  import flash.events.KeyboardEvent;
  import flash.ui.Keyboard;
  import flash.utils.Dictionary;
  
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.core.managers.UserManager;
  import org.bigbluebutton.main.events.MadePresenterEvent;
  import org.bigbluebutton.modules.whiteboard.business.shapes.DrawObject;
  import org.bigbluebutton.modules.whiteboard.business.shapes.GraphicFactory;
  import org.bigbluebutton.modules.whiteboard.business.shapes.GraphicObject;
  import org.bigbluebutton.modules.whiteboard.business.shapes.ShapeFactory;
  import org.bigbluebutton.modules.whiteboard.business.shapes.TextObject;
  import org.bigbluebutton.modules.whiteboard.business.shapes.WhiteboardConstants;
  import org.bigbluebutton.modules.whiteboard.events.WhiteboardDrawEvent;
  import org.bigbluebutton.modules.whiteboard.events.WhiteboardUpdateReceived;
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
    private var _annotationsList:Array = new Array();
	private var _cursors:Object = new Object();
    private var shapeFactory:ShapeFactory = new ShapeFactory();
    private var textUpdateListener:TextUpdateListener = new TextUpdateListener();
    
    private var width:Number;
    private var height:Number;
	private var presenterId:String;
	
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
          createGraphic(o);
          break;
        case AnnotationStatus.DRAW_UPDATE:
        case AnnotationStatus.DRAW_END:
          for (var i:int = _annotationsList.length -1; i >= 0; i--) {
            gobj = _annotationsList[i] as GraphicObject;
            if (gobj != null && gobj.id == o.id) {
              gobj.updateAnnotation(o);
              return;
            }
          }
          
          createGraphic(o);
          break;
      }
    }
    
	public function createGraphic(o:Annotation):void {
		var gobj:GraphicObject = shapeFactory.makeGraphicObject(o, whiteboardModel);
		if (gobj != null) {
			gobj.draw(o, shapeFactory.parentWidth, shapeFactory.parentHeight);
			wbCanvas.addGraphic(gobj as DisplayObject);
			_annotationsList.push(gobj);
			
			if (o.type == AnnotationType.TEXT && 
				o.status != AnnotationStatus.DRAW_END && 
				o.userId == UserManager.getInstance().getConference().getMyUserId()) {
				textUpdateListener.newTextObject(gobj as TextObject);
			}
		}
	}
	
    /* the following three methods are used to remove any GraphicObjects (and its subclasses) if the id of the object to remove is specified. The latter
    two are convenience methods, the main one is the first of the three.
    */
    private function removeGraphic(id:String):void {
      var gobjData:Array = getGobjInfoWithID(id);
      var removeIndex:int = gobjData[0];
      var gobjToRemove:GraphicObject = gobjData[1] as GraphicObject;
      wbCanvas.removeGraphic(gobjToRemove as DisplayObject);
      _annotationsList.splice(removeIndex, 1);
      
      if (gobjToRemove.toolType == WhiteboardConstants.TYPE_TEXT) {
        textUpdateListener.removedTextObject(gobjToRemove as TextObject);
      }
    }
    
    /* returns an array of the GraphicObject that has the specified id,
    and the index of that GraphicObject (if it exists, of course) 
    */
    private function getGobjInfoWithID(id:String):Array {  
      var data:Array = new Array();
      for(var i:int = 0; i < _annotationsList.length; i++) {
        var currObj:GraphicObject = _annotationsList[i] as GraphicObject;
        if(currObj.id == id) {
          data.push(i);
          data.push(currObj);
          return data;
        }
      }
      return null;
    }
    
    private function removeLastGraphic():void {
      var gobj:GraphicObject = _annotationsList.pop();
      if (gobj.toolType == WhiteboardConstants.TYPE_TEXT) {
		textUpdateListener.removedTextObject(gobj as TextObject);
      }
      wbCanvas.removeGraphic(gobj as DisplayObject);
    }
    
    public function clearBoard(userId:String=null):void {
      if (userId) {
        for (var i:Number = _annotationsList.length-1; i >= 0; i--){
          var gobj:GraphicObject = _annotationsList[i] as GraphicObject;
          if (gobj.userId == userId) {
            removeGraphic(_annotationsList[i].id);
          }
        }
      } else {
        var numGraphics:int = this._annotationsList.length;
        for (var j:Number = 0; j < numGraphics; j++){
          removeLastGraphic();
        }
      }
    }
    
    public function undoAnnotation(annotation:Annotation):void {
      if (this._annotationsList.length > 0) {
        removeGraphic(annotation.id);
      }
    }
        
    public function receivedAnnotationsHistory(wbId:String):void {
      var annotations:Array = whiteboardModel.getAnnotations(wbId);
      for (var i:int = 0; i < annotations.length; i++) {
        var an:Annotation = annotations[i] as Annotation;
        var gobj:GraphicObject = shapeFactory.makeGraphicObject(an, whiteboardModel);
        if (gobj != null) {
          gobj.draw(an, shapeFactory.parentWidth, shapeFactory.parentHeight);
          wbCanvas.addGraphic(gobj as DisplayObject);
          _annotationsList.push(gobj);
        }
      }
            
      if (_annotationsList.length > 0) {
        for (var ij:int = 0; ij < this._annotationsList.length; ij++){
          redrawGraphic(this._annotationsList[ij] as GraphicObject, ij);
        }
      }
	}
        
        public function changeWhiteboard(wbId:String):void{
            textUpdateListener.canvasMouseDown();
            
//            LogUtil.debug("**** CanvasDisplay changePage. Clearing page *****");
            clearBoard();
            
            var annotations:Array = whiteboardModel.getAnnotations(wbId);
//            LogUtil.debug("**** CanvasDisplay changePage [" + annotations.length + "] *****");
            for (var i:int = 0; i < annotations.length; i++) {
                var an:Annotation = annotations[i] as Annotation;
                // LogUtil.debug("**** Drawing graphic from changePage [" + an.type + "] *****");
                var gobj:GraphicObject = shapeFactory.makeGraphicObject(an, whiteboardModel);
                if (gobj != null) {
                    gobj.draw(an, shapeFactory.parentWidth, shapeFactory.parentHeight);
                    wbCanvas.addGraphic(gobj as DisplayObject);
                    _annotationsList.push(gobj);
                }
            }
        }
		
		public function drawCursor(userId:String, xPercent:Number, yPercent:Number):void {
			if (!_cursors.hasOwnProperty(userId)) {
				var userName:String = UsersUtil.getUserName(userId);
				var newCursor:WhiteboardCursor = new WhiteboardCursor(userId, userName, xPercent, yPercent, shapeFactory.parentWidth, shapeFactory.parentHeight, presenterId == userId);
				wbCanvas.addCursor(newCursor);
				
				_cursors[userId] = newCursor;
			} else {
				(_cursors[userId] as WhiteboardCursor).updatePosition(xPercent, yPercent);
			}
		}
		
		public function presenterChange(amIPresenter:Boolean, presenterId:String):void {
			this.presenterId = presenterId;
			
			for(var j:String in _cursors) {
				(_cursors[j] as WhiteboardCursor).updatePresenter(j == presenterId);
			}
		}
		
		public function userLeft(userId:String):void {
			if (_cursors.hasOwnProperty(userId)) {
				wbCanvas.removeCursorChild(_cursors[userId]);
				delete _cursors[userId];
			}
		}
    
    public function zoomCanvas(width:Number, height:Number):void{
      shapeFactory.setParentDim(width, height);  
      this.width = width;
      this.height = height;

      for (var i:int = 0; i < this._annotationsList.length; i++){
          redrawGraphic(this._annotationsList[i] as GraphicObject, i);
      }
	  
	  for(var j:String in _cursors) {
		  (_cursors[j] as WhiteboardCursor).updateParentSize(width, height);
	  }
    }
  
    private function redrawGraphic(gobj:GraphicObject, objIndex:int):void {
      gobj.redraw(shapeFactory.parentWidth, shapeFactory.parentHeight);
    }
  }
}
