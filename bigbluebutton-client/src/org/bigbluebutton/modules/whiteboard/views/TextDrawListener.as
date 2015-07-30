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
  import org.bigbluebutton.modules.whiteboard.business.shapes.ShapeFactory;
  import org.bigbluebutton.modules.whiteboard.business.shapes.TextDrawAnnotation;
  import org.bigbluebutton.modules.whiteboard.business.shapes.TextObject;
  import org.bigbluebutton.modules.whiteboard.business.shapes.WhiteboardConstants;
  import org.bigbluebutton.modules.whiteboard.events.WhiteboardDrawEvent;
  import org.bigbluebutton.modules.whiteboard.models.WhiteboardModel;
  import org.bigbluebutton.modules.whiteboard.views.models.WhiteboardTool;

  public class TextDrawListener implements IDrawListener
  {
    private var _wbCanvas:WhiteboardCanvas;
    private var _sendFrequency:int;
    private var _shapeFactory:ShapeFactory;
    private var _textStatus:String = TextObject.TEXT_CREATED;
    private var _mouseXDown:Number = 0;
    private var _mouseYDown:Number = 0;
    private var _mouseXMove:Number = 0;
    private var _mouseYMove:Number = 0;
    private var _idGenerator:AnnotationIDGenerator;
    private var _mousedDown:Boolean = false;
    private var _curID:String;
    private var feedback:RectangleFeedbackTextBox = new RectangleFeedbackTextBox();
    private var _wbModel:WhiteboardModel;
    
    public function TextDrawListener(idGenerator:AnnotationIDGenerator, 
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

    public function ctrlKeyDown(down:Boolean):void {
      // Ignore
    }

    public function onMouseDown(mouseX:Number, mouseY:Number, tool:WhiteboardTool):void
    {
      if (tool.graphicType == WhiteboardConstants.TYPE_TEXT) {
        _mouseXDown = _mouseXMove = mouseX;
        _mouseYDown = _mouseYMove = mouseY;
        
        // We have to keep track if the user has pressed the mouse. A mouseup event is
        // dispatched when the mouse goes out of the canvas, theu we end up sending a new text
        // even if the user has mousedDown yet.
        _mousedDown = true;
      }
    }

    public function onMouseMove(mouseX:Number, mouseY:Number, tool:WhiteboardTool):void
    {
      if (tool.graphicType == WhiteboardConstants.TYPE_TEXT && _mousedDown) {
        _mouseXMove = mouseX;
        _mouseYMove = mouseY;
        
        if (_wbCanvas.contains(feedback)) {
          _wbCanvas.removeRawChild(feedback);
        }

                feedback.draw(_mouseXDown, _mouseYDown, mouseX - _mouseXDown, mouseY - _mouseYDown);
                _wbCanvas.addRawChild(feedback);                
            }

        }
        
        public function onMouseUp(mouseX:Number, mouseY:Number, tool:WhiteboardTool):void
        {
            // We have to use the saved X and Y from the last mouse move rather than the X and 
            // Y from MouseUp because the latter might be outside the bounds of the area.
            
            if (tool.graphicType == WhiteboardConstants.TYPE_TEXT && _mousedDown) {
                feedback.clear();
                if (_wbCanvas.contains(feedback)) {
                    _wbCanvas.removeRawChild(feedback);
                }
                
                _mousedDown = false;

                var tbWidth:Number = Math.abs(_mouseXMove - _mouseXDown);
                var tbHeight:Number = Math.abs(_mouseYMove - _mouseYDown);
                
                if (tbHeight < 15 || tbWidth < 50) return;
                
                var tobj:TextDrawAnnotation = _shapeFactory.createTextObject("", 0x000000, Math.min(_mouseXDown, _mouseXMove), Math.min(_mouseYDown, _mouseYMove), tbWidth, tbHeight, 18);

                sendTextToServer(TextObject.TEXT_CREATED, tobj);                    
            }        
        }
        
        private function sendTextToServer(status:String, tobj:TextDrawAnnotation):void {
            switch (status) {
                case TextObject.TEXT_CREATED:
                    tobj.status = TextObject.TEXT_CREATED;
                    _textStatus = TextObject.TEXT_UPDATED;
					_curID = _idGenerator.generateID();
					tobj.id = _curID;
                    break;
                case TextObject.TEXT_UPDATED:
                    tobj.status = TextObject.TEXT_UPDATED;
					tobj.id = _curID;
                    break;
                case TextObject.TEXT_PUBLISHED:
                    tobj.status = TextObject.TEXT_PUBLISHED;
                    _textStatus = TextObject.TEXT_CREATED;
					tobj.id = _curID;
                    break;
            }	
			
            _wbCanvas.sendGraphicToServer(tobj.createAnnotation(_wbModel), WhiteboardDrawEvent.SEND_TEXT);			
        }
    }
}