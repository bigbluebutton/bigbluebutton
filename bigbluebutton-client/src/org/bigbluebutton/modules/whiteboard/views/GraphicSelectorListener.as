package org.bigbluebutton.modules.whiteboard.views
{
    import flash.display.DisplayObject;
    
    import org.bigbluebutton.common.LogUtil;
    import org.bigbluebutton.modules.whiteboard.business.shapes.DrawAnnotation;
    import org.bigbluebutton.modules.whiteboard.business.shapes.DrawObject;
    import org.bigbluebutton.modules.whiteboard.business.shapes.GraphicObject;
    import org.bigbluebutton.modules.whiteboard.business.shapes.ShapeFactory;
    import org.bigbluebutton.modules.whiteboard.business.shapes.TextDrawAnnotation;
    import org.bigbluebutton.modules.whiteboard.business.shapes.TextObject;
    import org.bigbluebutton.modules.whiteboard.business.shapes.WhiteboardConstants;
    import org.bigbluebutton.modules.whiteboard.events.WhiteboardDrawEvent;
    import org.bigbluebutton.modules.whiteboard.models.Annotation;
    import org.bigbluebutton.modules.whiteboard.models.WhiteboardModel;
    import org.bigbluebutton.modules.whiteboard.views.models.WhiteboardTool;

    public class GraphicSelectorListener extends Object implements IDrawListener
    {
        private var _selectedGraphicObject:GraphicObject = null;
        private var _draggedGraphicObject:GraphicObject = null;
        private var _wbCanvas:WhiteboardCanvas;
        private var _shapeFactory:ShapeFactory;
        private var _wbModel:WhiteboardModel;
        private var _isMouseStillDown:Boolean = false;
        private var _lastMouseDownX:Number;
        private var _lastMouseDownY:Number;
        private var _isIgnoringMouseUp:Boolean = false;
        private var _ctrlKeyDown:Boolean = false;
        private var _currentResizingButtonIndex:Number = -1;

        public function GraphicSelectorListener(wbCanvas:WhiteboardCanvas, shapeFactory:ShapeFactory, wbModel:WhiteboardModel)
        {
            this._wbCanvas = wbCanvas;
            this._shapeFactory = shapeFactory;
            this._wbModel = wbModel;
        }

        public function onMouseDown(mouseX:Number, mouseY:Number, tool:WhiteboardTool) : void
        {
        }

        public function onMouseMove(mouseX:Number, mouseY:Number, tool:WhiteboardTool) : void
        {
            if (tool.graphicType == WhiteboardConstants.TYPE_SELECTION && this._isMouseStillDown)
            {
                LogUtil.debug("onmouse move");
                if (this._draggedGraphicObject)
                {
                    LogUtil.debug("has _draggedGraphicObject");
                    var distanceX:Number = mouseX - this._lastMouseDownX;
                    var distanceY:Number = mouseY - this._lastMouseDownY;
                    this._lastMouseDownX = mouseX;
                    this._lastMouseDownY = mouseY;
                    this._draggedGraphicObject.movePoints(distanceX, distanceY, this._shapeFactory.parentWidth, this._shapeFactory.parentHeight);
                    this.sendModifiedGraphicToServer(this._draggedGraphicObject);
                }
                else
                {
                    LogUtil.debug("no _draggedGraphicObject");
                    LogUtil.debug("_currentResizingButtonIndex = " + this._currentResizingButtonIndex);
                    switch(this._currentResizingButtonIndex)
                    {
                        case 0:
                        {
                            LogUtil.debug("Before change top left");
                            this._selectedGraphicObject.changeTopLeft(mouseX, mouseY, this._shapeFactory.parentWidth, this._shapeFactory.parentHeight);
                            break;
                        }
                        case 1:
                        {
                            LogUtil.debug("Before change top middle");
                            this._selectedGraphicObject.changeTopMiddle(mouseY, this._shapeFactory.parentHeight);
                            break;
                        }
                        case 2:
                        {
                            LogUtil.debug("Before change top right");
                            this._selectedGraphicObject.changeTopRight(mouseX, mouseY, this._shapeFactory.parentWidth, this._shapeFactory.parentHeight);
                            break;
                        }
                        case 3:
                        {
                            LogUtil.debug("Before change middle left");
                            this._selectedGraphicObject.changeMiddleLeft(mouseX, this._shapeFactory.parentWidth);
                            break;
                        }
                        case 4:
                        {
                            LogUtil.debug("Before change middle right");
                            this._selectedGraphicObject.changeMiddleRight(mouseX, this._shapeFactory.parentWidth);
                            break;
                        }
                        case 5:
                        {
                            LogUtil.debug("Before change bottom left");
                            this._selectedGraphicObject.changeBottomLeft(mouseX, mouseY, this._shapeFactory.parentWidth, this._shapeFactory.parentHeight);
                            break;
                        }
                        case 6:
                        {
                            LogUtil.debug("Before change bottom middle");
                            this._selectedGraphicObject.changeBottomMiddle(mouseY, this._shapeFactory.parentHeight);
                            break;
                        }
                        case 7:
                        {
                            LogUtil.debug("Before change bottom right");
                            this._selectedGraphicObject.changeBottomRight(mouseX, mouseY, this._shapeFactory.parentWidth, this._shapeFactory.parentHeight);
                            break;
                        }
                        default:
                        {
                            return;
                        }
                    }
                    LogUtil.debug("before sending graphic to server when resizing");
                    this.sendModifiedGraphicToServer(this.selectedGraphicObject);
                    LogUtil.debug("after sending graphic to server when resizing");
                }
            }
        }

        public function onMouseUp(mouseX:Number, mouseY:Number, tool:WhiteboardTool) : void
        {
            LogUtil.debug("mouseUp fired");
            LogUtil.debug("tool.graphicType = " + tool.graphicType);
            LogUtil.debug("_isIgnoringMouseUp = " + this._isIgnoringMouseUp);
            
            if (tool.graphicType != WhiteboardConstants.TYPE_SELECTION || this._isIgnoringMouseUp)
            {
                return;
            }
			
            this._isMouseStillDown = false;
            this._draggedGraphicObject = null;
            this._currentResizingButtonIndex = -1;
            this._wbCanvas.setDrawingCanvasToWhiteboard();
        }

        public function ctrlKeyDown(down:Boolean) : void
        {
            this._ctrlKeyDown = down;
        }

        public function onGraphicMouseDown(graphic:GraphicObject, mouseX:Number, mouseY:Number, tool:WhiteboardTool) : void
        {
            if (tool.graphicType == WhiteboardConstants.TYPE_SELECTION)
            {
                this._isMouseStillDown = true;
                if (graphic is TextObject && this._ctrlKeyDown && graphic == this._selectedGraphicObject)
                {
                    this._wbCanvas.makeTextObjectEditable(graphic as TextObject);
                    this.setSeletedGraphicObject(null);
                }
                else
                {
                    this.setSeletedGraphicObject(graphic);
                    this._draggedGraphicObject = graphic;
                    this._lastMouseDownX = mouseX;
                    this._lastMouseDownY = mouseY;
                    this._isIgnoringMouseUp = true;
                    this._wbCanvas.setDrawingCanvasToSlide();
                    this._isIgnoringMouseUp = false;
                }
                LogUtil.debug("end onGraphicMouseDown");
            }
        }

        public function clearSelection() : void
        {
            this.setSeletedGraphicObject(null);
            return;
        }

        public function redrawSelectionBorder() : void
        {
            if (this._selectedGraphicObject == null)
            {
                LogUtil.debug("before clearSelectedBorder");
                this._wbCanvas.clearSelectionBorder();
            }
            else
            {
                LogUtil.debug("before drawSelectedBorderForShape");
                this._wbCanvas.drawGraphicSelectionBorder(this._selectedGraphicObject as DisplayObject);
            }
            return;
        }

        private function setSeletedGraphicObject(graphic:GraphicObject) : void
        {
            LogUtil.debug("setSeletedGraphicObject");
            if (this._selectedGraphicObject != graphic)
            {
                this._selectedGraphicObject = graphic;
                this.redrawSelectionBorder();
            }
            return;
        }

        public function get selectedGraphicObject() : GraphicObject
        {
            return this._selectedGraphicObject;
        }

        private function sendModifiedGraphicToServer(graphic:GraphicObject, isDeleted:Boolean = false) : void
        {
            if (graphic is DrawObject)
            {
                var dobj:DrawObject = graphic as DrawObject;
                var drawAnnotation:DrawAnnotation = this._shapeFactory.createDrawObject(dobj.getOriginatedToolType(), dobj.denormalizedPoints, dobj.drawColor, dobj.getThickness(), dobj.fillOn, dobj.fillColor, dobj.transparencyOn);
                drawAnnotation.id = dobj.id;
                if (isDeleted)
                {
                    drawAnnotation.status = DrawObject.DRAW_DELETED;
                }
                else
                {
                    drawAnnotation.status = DrawObject.DRAW_MODIFIED;
                }
                var annotation:Annotation = drawAnnotation.createAnnotation(this._wbModel, this._ctrlKeyDown);
                if (annotation != null)
                {
                    this._wbCanvas.sendGraphicToServer(annotation, WhiteboardDrawEvent.SEND_SHAPE);
                }
            }
            else if (graphic is TextObject)
            {
                var tobj:TextObject = graphic as TextObject;
                var textDrawAnnotation:TextDrawAnnotation = this._shapeFactory.createTextObject(tobj.text, tobj.textColor, tobj.denormalize(tobj.getOrigX(), this._shapeFactory.parentWidth), tobj.denormalize(tobj.getOrigY(), this._shapeFactory.parentHeight), tobj.denormalize(tobj.textBoxWidth, this._shapeFactory.parentWidth), tobj.denormalize(tobj.textBoxHeight, this._shapeFactory.parentHeight), tobj.textSize);
                textDrawAnnotation.id = tobj.id;
                if (isDeleted)
                {
                    textDrawAnnotation.status = TextObject.TEXT_DELETED;
                }
                else
                {
                    textDrawAnnotation.status = TextObject.TEXT_MODIFIED;
                }
                this._wbCanvas.sendGraphicToServer(textDrawAnnotation.createAnnotation(this._wbModel), WhiteboardDrawEvent.SEND_TEXT);
            }
        }

        public function doResizeButtonMouseDown(buttonIndex:Number, mouseX:Number, mouseY:Number) : void
        {
            this._currentResizingButtonIndex = buttonIndex;
            this._isMouseStillDown = true;
            this._lastMouseDownX = mouseX;
            this._lastMouseDownY = mouseY;
            this._isIgnoringMouseUp = true;
            this._wbCanvas.setDrawingCanvasToSlide();
            this._isIgnoringMouseUp = false;
            LogUtil.debug("end graphicselector doResizeButtonMouseDown");
        }

        public function onSelectorBorderDoubleClick() : void
        {
            if (this._selectedGraphicObject && this._selectedGraphicObject is TextObject)
            {
                this._wbCanvas.makeTextObjectEditable(this._selectedGraphicObject as TextObject);
                this.setSeletedGraphicObject(null);
            }
        }

        public function deleteSelectedShape(tool:WhiteboardTool) : void
        {
            if (tool.graphicType == WhiteboardConstants.TYPE_SELECTION && this._selectedGraphicObject)
            {
                this.sendModifiedGraphicToServer(this._selectedGraphicObject, true);
                this.setSeletedGraphicObject(null);
            }
        }
    }
}
