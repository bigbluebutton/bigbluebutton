package org.bigbluebutton.modules.whiteboard.views
{
    import org.bigbluebutton.common.LogUtil;
    import org.bigbluebutton.modules.whiteboard.business.shapes.DrawObject;
    import org.bigbluebutton.modules.whiteboard.business.shapes.Pencil;
    import org.bigbluebutton.modules.whiteboard.business.shapes.ShapeFactory;
    import org.bigbluebutton.modules.whiteboard.business.shapes.WhiteboardConstants;
    import org.bigbluebutton.modules.whiteboard.events.WhiteboardDrawEvent;
    import org.bigbluebutton.modules.whiteboard.models.Annotation;
    import org.bigbluebutton.modules.whiteboard.views.models.WhiteboardTool;
    
    public class PencilDrawListener implements IDrawListener
    {
        private var _drawStatus:String = DrawObject.DRAW_START;
        private var _isDrawing:Boolean; 
        private var _segment:Array = new Array();
        private var _wbCanvas:WhiteboardCanvas;
        private var _sendFrequency:int;
        private var _shapeFactory:ShapeFactory;
        
        public function PencilDrawListener(wbCanvas:WhiteboardCanvas, sendShapeFrequency:int, shapeFactory:ShapeFactory )
        {
            _wbCanvas = wbCanvas;
            _sendFrequency = sendShapeFrequency;
            _shapeFactory = shapeFactory;
        }
        
        public function onMouseDown(mouseX:Number, mouseY:Number, tool:WhiteboardTool):void
        {
 //           LogUtil.debug("PencilDrawListener onMouseDown [" + mouseX + "," + mouseY + "]");
            if (tool.graphicType == WhiteboardConstants.TYPE_SHAPE) {
                LogUtil.debug("PencilDrawListener onMouseDown [" + tool.graphicType +"," + mouseX + "," + mouseY + "]");
                _isDrawing = true;
                _drawStatus = DrawObject.DRAW_START;
                _segment = new Array();               
                _segment.push(mouseX);
                _segment.push(mouseY);
            } 
        }
        
        public function onMouseMove(mouseX:Number, mouseY:Number, tool:WhiteboardTool):void
        {
            if (tool.graphicType == WhiteboardConstants.TYPE_SHAPE) {
                if (_isDrawing){
                    _segment.push(mouseX);
                    _segment.push(mouseY);
                    LogUtil.debug("PencilDrawListener onMouseMove [" + tool.graphicType +"," + mouseX + "," + mouseY + "]");
                    if (_segment.length > _sendFrequency) {                       
                        sendShapeToServer(_drawStatus, tool);
                    }	
                }                
            }
        }
        
        public function onMouseUp(tool:WhiteboardTool):void
        {
            LogUtil.debug("PencilDrawListener onMouseUp");
            if(tool.graphicType == WhiteboardConstants.TYPE_SHAPE) {
                LogUtil.debug("PencilDrawListener onMouseUp [" + tool.graphicType + "]");
                if (_isDrawing) {
                    LogUtil.debug("PencilDrawListener onMouseUp - drawing = [" + _isDrawing + "]");
                    /**
                     * Check if we are drawing because when resizing the window, it generates
                     * a mouseUp event at the end of resize. We don't want to dispatch another
                     * shape to the viewers.
                     */
                    _isDrawing = false;
                    
                    //check to make sure unnecessary data is not sent ex. a single click when the rectangle tool is selected
                    // is hardly classifiable as a rectangle, and should not be sent to the server
                    if (tool.toolType == DrawObject.RECTANGLE || tool.toolType == DrawObject.ELLIPSE || tool.toolType == DrawObject.TRIANGLE) {						
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
            LogUtil.debug("PencilDrawListener sendShapeToServer - segment Length= [" + _segment.length + "]");
            if (_segment.length == 0) return;
            
            var s:String = "{type=" + tool.toolType + ",points=";
            for (var pq:int = 0; pq < _segment.length; pq++) {
                s += _segment[pq] + ",";
            }
            s += "]}";
            LogUtil.debug("PencilDrawListener sendShapeToServer - Got here 2 [" + s + "]");
            
            LogUtil.debug("PencilDrawListener sendShapeToServer - Got here 0");
            
            var dobj:DrawObject = _shapeFactory.createDrawObject(tool.toolType, _segment, tool.drawColor, tool.thickness, tool.fillOn, tool.fillColor, tool.transparencyOn);
            
            switch (status) {
                case DrawObject.DRAW_START:
                    dobj.status = DrawObject.DRAW_START;
                    _drawStatus = DrawObject.DRAW_UPDATE;
                    break;
                case DrawObject.DRAW_UPDATE:
                    dobj.status = DrawObject.DRAW_UPDATE;								
                    break;
                case DrawObject.DRAW_END:
                    dobj.status = DrawObject.DRAW_END;
                    _drawStatus = DrawObject.DRAW_START;
                    break;
            }
            
            var points:String = "{type=" + dobj.getType() + ",points=";
            for (var p:int = 0; p < dobj.getShapeArray().length; p++) {
                points += dobj.getShapeArray()[p] + ",";
            }
            points += "]}";
            LogUtil.debug("PencilDrawListener sendShapeToServer - Got here 2 [" + points + "]");
            
            
            LogUtil.debug("PencilDrawListener sendShapeToServer - Got here 1 - type [" + tool.toolType + "]");
            
            if (tool.toolType == DrawObject.PENCIL) {
                LogUtil.debug("PencilDrawListener sendShapeToServer - Got here 1.1 - type [" + tool.toolType + "]");
                dobj.status = DrawObject.DRAW_END;
                LogUtil.debug("PencilDrawListener sendShapeToServer - Got here 1.2 - type [" + tool.toolType + "]");
                _drawStatus = DrawObject.DRAW_START;
                LogUtil.debug("PencilDrawListener sendShapeToServer - Got here 1.3 - type [" + tool.toolType + "]");
                _segment = new Array();	
                LogUtil.debug("PencilDrawListener sendShapeToServer - Got here 1.4 - type [" + tool.toolType + "]");
                var xy:Array = _wbCanvas.getMouseXY();
                LogUtil.debug("PencilDrawListener sendShapeToServer - Got here 1.5 - type [" + tool.toolType + "]");
                _segment.push(xy[0], xy[1]);
                LogUtil.debug("PencilDrawListener sendShapeToServer - Got here 1.6 - type [" + tool.toolType + "]");
            }
/*            
            var points:String = "{type=" + dobj.getType() + ",points=";
            for (var p:int = 0; p < dobj.getShapeArray().length; p++) {
                points += dobj.getShapeArray()[p] + ",";
            }
            points += "]}";
            
            LogUtil.debug("PencilDrawListener sendShapeToServer - Got here 2 [" + points + "]");
*/            
            var annotation:Object = new Object();
            annotation["type"] = dobj.getType();
            annotation["points"] = dobj.getShapeArray();
            annotation["color"] = dobj.getColor();
            annotation["thickness"] = dobj.getThickness();
            annotation["id"] = dobj.getGraphicID();
            annotation["status"] = dobj.status;
            annotation["fill"] = dobj.getFill();
            annotation["fillColor"] = dobj.getFillColor();
            annotation["transparency"] = dobj.getTransparency();
            
            LogUtil.debug("PencilDrawListener sendGraphicToServer");
            var msg:Annotation = new Annotation(dobj.getGraphicID(), dobj.getType(), annotation);
            _wbCanvas.sendGraphicToServer(msg, WhiteboardDrawEvent.SEND_SHAPE);			
        }
    }
}