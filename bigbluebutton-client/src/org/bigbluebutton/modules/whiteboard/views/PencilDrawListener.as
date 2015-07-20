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
package org.bigbluebutton.modules.whiteboard.views
{
  import org.bigbluebutton.modules.whiteboard.business.shapes.DrawAnnotation;
  import org.bigbluebutton.modules.whiteboard.business.shapes.DrawObject;
  import org.bigbluebutton.modules.whiteboard.business.shapes.ShapeFactory;
  import org.bigbluebutton.modules.whiteboard.business.shapes.WhiteboardConstants;
  import org.bigbluebutton.modules.whiteboard.events.WhiteboardDrawEvent;
  import org.bigbluebutton.modules.whiteboard.models.Annotation;
  import org.bigbluebutton.modules.whiteboard.models.WhiteboardModel;
  import org.bigbluebutton.modules.whiteboard.views.models.WhiteboardTool;
  
  public class PencilDrawListener implements IDrawListener
  {
    private var _drawStatus:String = DrawObject.DRAW_START;
    private var _isDrawing:Boolean; 
    private var _segment:Array = new Array();
    private var _wbCanvas:WhiteboardCanvas;
    private var _sendFrequency:int;
    private var _shapeFactory:ShapeFactory;
    private var _ctrlKeyDown:Boolean = false;
		private var _idGenerator:AnnotationIDGenerator;
		private var _curID:String;
		private var _wbModel:WhiteboardModel;
        
    public function PencilDrawListener(idGenerator:AnnotationIDGenerator, 
                                       wbCanvas:WhiteboardCanvas, 
                                       sendShapeFrequency:int, 
                                       shapeFactory:ShapeFactory, 
                                       wbModel:WhiteboardModel)
    {
      _idGenerator = idGenerator;
      _wbCanvas = wbCanvas;
      _sendFrequency = sendShapeFrequency;
      _shapeFactory = shapeFactory;
      _wbModel = wbModel;
    }
    
    private var objCount:Number = 0;
    
    public function onMouseDown(mouseX:Number, mouseY:Number, tool:WhiteboardTool):void
    {
      if (tool.graphicType == WhiteboardConstants.TYPE_SHAPE) {
        _isDrawing = true;
        _drawStatus = DrawObject.DRAW_START;
        
        // Generate a shape id so we can match the mouse down and up events. Then we can
        // remove the specific shape when a mouse up occurs.
        _curID = _idGenerator.generateID();
        
//        LogUtil.debug("* START count = [" + objCount + "] id=[" + _curID + "]"); 
        
        
        _segment = new Array();               
        _segment.push(mouseX);
        _segment.push(mouseY);
      } 
    }
        
    public function ctrlKeyDown(down:Boolean):void {
      _ctrlKeyDown = down;
    }

    // Store the mouse's last x and y position
    private var _lastMouseX:Number = 0;
    private var _lastMouseY:Number = 0;
    
    public function onMouseMove(mouseX:Number, mouseY:Number, tool:WhiteboardTool):void
    {
      if (tool.graphicType == WhiteboardConstants.TYPE_SHAPE) {
        if (_isDrawing){

          // Throttle the mouse position to prevent us from overloading the server
//          if ( (Math.abs(mouseX - _lastMouseX) < 3) && (Math.abs(mouseY - _lastMouseY) < 3) ) {
//            return;
//          }
          _lastMouseX = mouseX;
          _lastMouseY = mouseY;
          
          _segment.push(mouseX);
          _segment.push(mouseY);
          if (_segment.length > _sendFrequency) {
            sendShapeToServer(_drawStatus, tool);
          }	
        }
      }
    }

    public function onMouseUp(mouseX:Number, mouseY:Number, tool:WhiteboardTool):void
    {
      if (tool.graphicType == WhiteboardConstants.TYPE_SHAPE) {
        if (_isDrawing) {
          /**
            * Check if we are drawing because when resizing the window, it generates
            * a mouseUp event at the end of resize. We don't want to dispatch another
            * shape to the viewers.
            */
          _isDrawing = false;

          // check to make sure unnecessary data is not sent ex. a single click when the rectangle tool is selected
          // is hardly classifiable as a rectangle, and should not be sent to the server
          if (tool.toolType == DrawObject.RECTANGLE || 
              tool.toolType == DrawObject.ELLIPSE || 
              tool.toolType == DrawObject.TRIANGLE) {		
            
            var x:Number = _segment[0];
            var y:Number = _segment[1];
            var width:Number = _segment[_segment.length-2]-x;
            var height:Number = _segment[_segment.length-1]-y;

            if (!(Math.abs(width) <= 2 && Math.abs(height) <=2)) {
              sendShapeToServer(DrawObject.DRAW_END, tool);
           }
          } else {
            sendShapeToServer(DrawObject.DRAW_END, tool);
          } /* (tool.toolType */					
        } /* (_isDrawing) */                
      }
    }
    
    private function sendShapeToServer(status:String, tool:WhiteboardTool):void {
      if (_segment.length == 0) {
//        LogUtil.debug("SEGMENT LENGTH = 0");
        return;
      }
                       
      var dobj:DrawAnnotation = _shapeFactory.createDrawObject(tool.toolType, _segment, tool.drawColor, tool.thickness, 
                                                  tool.fillOn, tool.fillColor, tool.transparencyOn);
            
      /** PENCIL is a special case as each segment is a separate shape 
      *   Force the status to always DRAW_START to generate unique ids.
      * **/
      if (tool.toolType == DrawObject.PENCIL) {
          status = DrawObject.DRAW_START;
          _curID = _idGenerator.generateID();
      }
      
      switch (status) {
        case DrawObject.DRAW_START:
          dobj.status = DrawObject.DRAW_START;
          dobj.id = _curID;
//          LogUtil.debug("START count = [" + objCount + "] id=[" + _curID + "]");
          _drawStatus = DrawObject.DRAW_UPDATE;
          break;
        case DrawObject.DRAW_UPDATE:
          dobj.status = DrawObject.DRAW_UPDATE;
          dobj.id = _curID;
//          LogUtil.debug("UPDATE count = [" + objCount + "] id=[" + _curID + "]");
          break;
        case DrawObject.DRAW_END:
          dobj.status = DrawObject.DRAW_END;
          dobj.id = _curID;
          _drawStatus = DrawObject.DRAW_START;
          
//          LogUtil.debug("END count = [" + objCount + "] id=[" + _curID + "]"); 
//          objCount++;
          
          break;
      }
            
      /** PENCIL is a special case as each segment is a separate shape **/
      if (tool.toolType == DrawObject.PENCIL) {
        dobj.status = DrawObject.DRAW_START;
        _drawStatus = DrawObject.DRAW_START;
        _segment = new Array();	
        var xy:Array = _wbCanvas.getMouseXY();
        _segment.push(xy[0], xy[1]);
      }
           
      var an:Annotation = dobj.createAnnotation(_wbModel, _ctrlKeyDown);
      if (an != null) {
        _wbCanvas.sendGraphicToServer(an, WhiteboardDrawEvent.SEND_SHAPE);
      }
            			
    }
  }
}