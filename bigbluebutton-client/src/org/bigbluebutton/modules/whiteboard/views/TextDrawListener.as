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
package org.bigbluebutton.modules.whiteboard.views {
    import org.bigbluebutton.modules.whiteboard.business.shapes.ShapeFactory;
    import org.bigbluebutton.modules.whiteboard.business.shapes.TextDrawAnnotation;
    import org.bigbluebutton.modules.whiteboard.business.shapes.WhiteboardConstants;
    import org.bigbluebutton.modules.whiteboard.models.AnnotationStatus;
    import org.bigbluebutton.modules.whiteboard.views.models.WhiteboardTool;

    public class TextDrawListener implements IDrawListener {
        private var _wbCanvas:WhiteboardCanvas;

        private var _shapeFactory:ShapeFactory;

        private var _mouseXDown:Number = 0;

        private var _mouseYDown:Number = 0;

        private var _mouseXMove:Number = 0;

        private var _mouseYMove:Number = 0;

        private var _singleClickWidth:Number = 260;

        private var _singleClickHeight:Number = 110;

        private var _idGenerator:AnnotationIDGenerator;

        private var _mousedDown:Boolean = false;

        private var _wasEditing:Boolean = false;

        private var _curID:String;

        private var _wbId:String;

        private var feedback:RectangleFeedbackTextBox = new RectangleFeedbackTextBox();

        public function TextDrawListener(idGenerator:AnnotationIDGenerator, wbCanvas:WhiteboardCanvas, shapeFactory:ShapeFactory) {
            _idGenerator = idGenerator;
            _wbCanvas = wbCanvas;
            _shapeFactory = shapeFactory;
        }

        public function onMouseDown(mouseX:Number, mouseY:Number, tool:WhiteboardTool, wbId:String):void {
            if (tool.graphicType == WhiteboardConstants.TYPE_TEXT) {
                _mouseXDown = _mouseXMove = mouseX;
                _mouseYDown = _mouseYMove = mouseY;

                // We have to keep track if the user has pressed the mouse. A mouseup event is
                // dispatched when the mouse goes out of the canvas, theu we end up sending a new text
                // even if the user has mousedDown yet.
                _mousedDown = true;
                
                _wbId = wbId;
                
                // Need to check whether we were editing on mouse down because the edit will be finished by the time mouse up happens
                _wasEditing = _wbCanvas.isEditingText();
                
                _wbCanvas.addGraphic(feedback);
            }
        }

        public function onMouseMove(mouseX:Number, mouseY:Number, tool:WhiteboardTool):void {
            if (tool.graphicType == WhiteboardConstants.TYPE_TEXT && _mousedDown) {
                _mouseXMove = mouseX;
                _mouseYMove = mouseY;

                feedback.draw(_mouseXDown, _mouseYDown, mouseX - _mouseXDown, mouseY - _mouseYDown);
            }
        }

        public function onMouseUp(mouseX:Number, mouseY:Number, tool:WhiteboardTool):void {
            // We have to use the saved X and Y from the last mouse move rather than the X and 
            // Y from MouseUp because the latter might be outside the bounds of the area.

            if (tool.graphicType == WhiteboardConstants.TYPE_TEXT && _mousedDown) {
                feedback.clear();
                if (_wbCanvas.contains(feedback)) {
                    _wbCanvas.removeGraphic(feedback);
                }

                _mousedDown = false;

                var tbWidth:Number = Math.abs(_mouseXMove - _mouseXDown);
                var tbHeight:Number = Math.abs(_mouseYMove - _mouseYDown);

                if (tbHeight == 0 && tbWidth == 0 && !_wasEditing) {
                    tbWidth = _singleClickWidth;
                    tbHeight = _singleClickHeight;
                    if (_mouseXDown + _singleClickWidth > _wbCanvas.width || _mouseYDown + _singleClickHeight > _wbCanvas.height) {
                        _mouseXDown = _wbCanvas.width - _singleClickWidth;
                        _mouseYDown = _wbCanvas.height - _singleClickHeight;
                    }
                } else if (tbHeight < 15 || tbWidth < 50) {
                    return;
                }

                var tobj:TextDrawAnnotation = _shapeFactory.createTextAnnotation("", 0x000000, Math.min(_mouseXDown, _mouseXMove), Math.min(_mouseYDown, _mouseYMove), tbWidth, tbHeight, 18);

                sendTextToServer(AnnotationStatus.DRAW_START, tobj);
            }
        }
        
        public function stopDrawing(mouseX:Number, mouseY:Number):void {
            feedback.clear();
            if (_wbCanvas.contains(feedback)) {
              _wbCanvas.removeGraphic(feedback);
            }
            
            _mousedDown = false;
        }

        private function sendTextToServer(status:String, tobj:TextDrawAnnotation):void {
            if (status == AnnotationStatus.DRAW_START) {
                _curID = _idGenerator.generateID();
            }
            tobj.status = status;
            tobj.id = _curID;

            _wbCanvas.sendGraphicToServer(tobj.createAnnotation(_wbId));
        }
    }
}
