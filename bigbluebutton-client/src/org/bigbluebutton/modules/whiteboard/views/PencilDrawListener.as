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
  import flash.events.TimerEvent;
  import flash.geom.Point;
  import flash.utils.Timer;
  
  import org.bigbluebutton.modules.whiteboard.business.shapes.PencilDrawAnnotation;
  import org.bigbluebutton.modules.whiteboard.business.shapes.ShapeFactory;
  import org.bigbluebutton.modules.whiteboard.business.shapes.WhiteboardConstants;
  import org.bigbluebutton.modules.whiteboard.models.Annotation;
  import org.bigbluebutton.modules.whiteboard.models.AnnotationStatus;
  import org.bigbluebutton.modules.whiteboard.models.AnnotationType;
  import org.bigbluebutton.modules.whiteboard.views.models.WhiteboardTool;
  
  public class PencilDrawListener implements IDrawListener
  {
    private var _drawStatus:String = AnnotationStatus.DRAW_START;
    private var _isDrawing:Boolean = false;; 
    private var _segment:Array = new Array();
    private var _dimensions:Array = new Array();
    private var _wbCanvas:WhiteboardCanvas;
    private var _shapeFactory:ShapeFactory;
    private var _idGenerator:AnnotationIDGenerator;
    private var _curID:String;
    private var _wbId:String = null;
    private var _localTool:WhiteboardTool = new WhiteboardTool();
    private var _updateTimer:Timer = new Timer(50, 0);
    
    public function PencilDrawListener(idGenerator:AnnotationIDGenerator, 
                                       wbCanvas:WhiteboardCanvas, 
                                       shapeFactory:ShapeFactory)
    {
      _idGenerator = idGenerator;
      _wbCanvas = wbCanvas;
      _shapeFactory = shapeFactory;
      
      _updateTimer.addEventListener(TimerEvent.TIMER, onTimer);
    }
    
    public function onMouseDown(mouseX:Number, mouseY:Number, tool:WhiteboardTool, wbId:String):void {
      //if (tool.graphicType == WhiteboardConstants.TYPE_SHAPE) {
      if (tool.toolType == AnnotationType.PENCIL) {
        if (_isDrawing) {
          onMouseUp(mouseX, mouseY, tool);
          return;
        }
        
        _isDrawing = true;
        _drawStatus = AnnotationStatus.DRAW_START;
        
        _wbId = wbId;
        
        _localTool = WhiteboardTool.copy(tool);
        
        // Generate a shape id so we can match the mouse down and up events. Then we can
        // remove the specific shape when a mouse up occurs.
        _curID = _idGenerator.generateID();
        
        //normalize points as we get them to avoid shape drift
        var np:Point = _shapeFactory.normalizePoint(mouseX, mouseY);
        
        _segment = new Array();
        _segment.push(np.x);
        _segment.push(np.y);
        
        sendShapeToServer(AnnotationStatus.DRAW_START);
        
        _updateTimer.start();
        
        _segment = new Array();
      } 
    }
    
    public function onMouseMove(mouseX:Number, mouseY:Number, tool:WhiteboardTool):void {
      if (tool.graphicType == WhiteboardConstants.TYPE_SHAPE) {
        if (_isDrawing){
          
          _localTool = WhiteboardTool.copy(tool);
          
          //normalize points as we get them to avoid shape drift
          var np:Point = _shapeFactory.normalizePoint(mouseX, mouseY);
          
          _segment.push(np.x);
          _segment.push(np.y);
        }
      }
    }

    public function onMouseUp(mouseX:Number, mouseY:Number, tool:WhiteboardTool):void {
      if (tool.graphicType == WhiteboardConstants.TYPE_SHAPE) {
        if (_isDrawing) {
          sendDrawEnd(mouseX, mouseY);
        }
      }
    }
    
    public function stopDrawing(mouseX:Number, mouseY:Number):void {
      if (_isDrawing) {
        sendDrawEnd(mouseX, mouseY);
      }
    }
    
    private function sendDrawEnd(mouseX:Number, mouseY:Number):void {
      _isDrawing = false;
      
      //normalize points as we get them to avoid shape drift
      var np:Point = _shapeFactory.normalizePoint(mouseX, mouseY);
      
      _segment.push(np.x);
      _segment.push(np.y);
      
      _dimensions = new Array();
      _dimensions.push(_wbCanvas.width);
      _dimensions.push(_wbCanvas.height);
      sendShapeToServer(AnnotationStatus.DRAW_END);
      
      _updateTimer.stop();
    }
    
    private function onTimer(e:TimerEvent):void {
      if (_segment.length > 0) {
        sendShapeToServer(AnnotationStatus.DRAW_UPDATE);
        
        _segment = new Array();
      }
    }
    
    private function sendShapeToServer(status:String):void {
      if (_segment.length == 0) {
//        LogUtil.debug("SEGMENT LENGTH = 0");
        return;
      }
                       
      var dobj:PencilDrawAnnotation = _shapeFactory.createDrawObject(_localTool.toolType, _segment, _localTool.drawColor, _localTool.thickness) as PencilDrawAnnotation;
      
      dobj.status = status;
      dobj.id = _curID;
      
      if (status == AnnotationStatus.DRAW_END) {
        dobj.addDimensions(_dimensions);
      }
      
      var an:Annotation = dobj.createAnnotation(_wbId);
      
      if (an != null) {
        _wbCanvas.sendGraphicToServer(an);
      }
    }
  }
}