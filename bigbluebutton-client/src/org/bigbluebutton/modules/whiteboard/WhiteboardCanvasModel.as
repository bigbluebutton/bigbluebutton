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
  import org.bigbluebutton.modules.whiteboard.business.shapes.ShapeFactory;
  import org.bigbluebutton.modules.whiteboard.views.AnnotationIDGenerator;
  import org.bigbluebutton.modules.whiteboard.views.CursorPositionListener;
  import org.bigbluebutton.modules.whiteboard.views.IDrawListener;
  import org.bigbluebutton.modules.whiteboard.views.PencilDrawListener;
  import org.bigbluebutton.modules.whiteboard.views.ShapeDrawListener;
  import org.bigbluebutton.modules.whiteboard.views.TextDrawListener;
  import org.bigbluebutton.modules.whiteboard.views.WhiteboardCanvas;
  import org.bigbluebutton.modules.whiteboard.views.models.WhiteboardTool;

    /**
    * Class responsible for handling actions from presenter and sending annotations to the server.
    */
  public class WhiteboardCanvasModel {
    private var _wbCanvas:WhiteboardCanvas;	      
    private var drawListeners:Array = new Array();
	private var cursorPositionListener:CursorPositionListener;
    private var wbTool:WhiteboardTool = new WhiteboardTool();
    private var shapeFactory:ShapeFactory = new ShapeFactory();
    private var idGenerator:AnnotationIDGenerator = new AnnotationIDGenerator();
        
    public function setDependencies(canvas:WhiteboardCanvas):void {
      _wbCanvas = canvas;
      
      drawListeners.push(new PencilDrawListener(idGenerator, _wbCanvas, shapeFactory));
      drawListeners.push(new ShapeDrawListener(idGenerator, _wbCanvas, shapeFactory));
      drawListeners.push(new TextDrawListener(idGenerator, _wbCanvas, shapeFactory));
	  
	  cursorPositionListener = new CursorPositionListener(_wbCanvas, shapeFactory);
    }
        
    public function zoomCanvas(width:Number, height:Number):void {
      shapeFactory.setParentDim(width, height);
    }
        
    public function changeFontStyle(font:String):void {
      wbTool._fontStyle = font;	
    }

    public function changeFontSize(size:Number):void {
      wbTool._fontSize = size;
    }
    
    public function doMouseUp(mouseX:Number, mouseY:Number):void {
      // LogUtil.debug("CanvasModel doMouseUp ***");
      for (var ob:int = 0; ob < drawListeners.length; ob++) {
        (drawListeners[ob] as IDrawListener).onMouseUp(mouseX, mouseY, wbTool);
      }
    }

    public function doMouseDown(mouseX:Number, mouseY:Number, wbId:String):void {
      // LogUtil.debug("*** CanvasModel doMouseDown");
      for (var ob:int = 0; ob < drawListeners.length; ob++) {
        (drawListeners[ob] as IDrawListener).onMouseDown(mouseX, mouseY, wbTool, wbId);
      }
    }

    public function doMouseMove(mouseX:Number, mouseY:Number):void {
      for (var ob:int = 0; ob < drawListeners.length; ob++) {
        (drawListeners[ob] as IDrawListener).onMouseMove(mouseX, mouseY, wbTool);
      }
    }

    public function stopDrawing(mouseX:Number, mouseY:Number): void {
      for (var ob:int = 0; ob < drawListeners.length; ob++) {
        (drawListeners[ob] as IDrawListener).stopDrawing(mouseX, mouseY);
      }
    }

    public function setGraphicType(type:String):void {
      //LogUtil.debug("!!! Set graphic type = " + type);
      wbTool.graphicType = type;
    }

    public function setTool(s:String):void {
      // LogUtil.debug("!!!! Set graphic tool = " + s);
      wbTool.toolType = s;
    }

    public function changeColor(color:uint):void {
      wbTool.drawColor = color;
    }
    
    public function changeThickness(thickness:uint):void {
      wbTool.thickness = thickness;
    }
	
	public function presenterChange(amIPresenter:Boolean, presenterId:String):void {
		cursorPositionListener.presenterChange(amIPresenter);
	}
	
	public function multiUserChange(multiUser:Boolean):void {
		cursorPositionListener.multiUserChange(multiUser);
	}

  }
}
