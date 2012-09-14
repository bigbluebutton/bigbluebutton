package org.bigbluebutton.modules.whiteboard.views
{
  import org.bigbluebutton.common.LogUtil;
  import org.bigbluebutton.modules.whiteboard.business.shapes.ShapeFactory;
  import org.bigbluebutton.modules.whiteboard.business.shapes.TextDrawAnnotation;
  import org.bigbluebutton.modules.whiteboard.business.shapes.TextObject;
  import org.bigbluebutton.modules.whiteboard.business.shapes.WhiteboardConstants;
  import org.bigbluebutton.modules.whiteboard.events.WhiteboardDrawEvent;
  import org.bigbluebutton.modules.whiteboard.models.Annotation;
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
        _mouseXDown = mouseX;
        _mouseYDown = mouseY;

        // We have to keep track if the user has pressed the mouse. A mouseup event is
        // dispatched when the mouse goes out of the canvas, theu we end up sending a new text
        // even if the user has mousedDown yet.
        _mousedDown = true;
      }
    }

    public function onMouseMove(mouseX:Number, mouseY:Number, tool:WhiteboardTool):void
    {
      if (tool.graphicType == WhiteboardConstants.TYPE_TEXT && _mousedDown) {
        if (_wbCanvas.contains(feedback)) {
          _wbCanvas.removeRawChild(feedback);
        }

                feedback.draw(_mouseXDown, _mouseYDown, mouseX - _mouseXDown, mouseY - _mouseYDown);
                _wbCanvas.addRawChild(feedback);                
            }

        }
        
        public function onMouseUp(mouseX:Number, mouseY:Number, tool:WhiteboardTool):void
        {
            if (tool.graphicType == WhiteboardConstants.TYPE_TEXT && _mousedDown) {
                feedback.clear();
                if (_wbCanvas.contains(feedback)) {
                    _wbCanvas.removeRawChild(feedback);
                }
                
                _mousedDown = false;

                var tbWidth:Number = mouseX - _mouseXDown;
                var tbHeight:Number = mouseY - _mouseYDown;
                
                if (tbHeight < 15 || tbWidth < 50) return;
                
                var tobj:TextDrawAnnotation = _shapeFactory.createTextObject("", 0x000000, _mouseXDown, _mouseYDown, tbWidth, tbHeight, 18);

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