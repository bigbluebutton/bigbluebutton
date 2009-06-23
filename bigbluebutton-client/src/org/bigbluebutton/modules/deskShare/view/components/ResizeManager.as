package org.bigbluebutton.modules.deskShare.view.components
{
    import flash.display.Graphics;
    import flash.events.MouseEvent;
    
    import mx.controls.scrollClasses.ScrollBar;
    import mx.core.Container;
    import mx.core.IChildList;
    import mx.core.UIComponent;
    
    
    /**
     * Utility class for allowing containers to be resized by a resize handle.
     * Adds a small resize handle to a parent UIComponent.  This resize handle will 
     * cause the parent UIComponent to be resized when the user drags the handle.
     * 
     * @author Chris Callendar
     * @date March 17th, 2009
     */
    public class ResizeManager
    {
        
        private const RESIZE_HANDLE_SIZE:int = 16;
        private var resizeInitX:Number = 0;
        private var resizeInitY:Number = 0;
        
        private var _resizeHandle:UIComponent;
        private var _enabled:Boolean;
        private var repaint:Boolean;
        private var lastColor:uint = 0x0;
        private var lastAlpha:Number = 0;
        
        private var parent:UIComponent;
        
        public function ResizeManager(parent:UIComponent) {
            this.parent = parent;
            this._enabled = true;
            repaint = true;
        }
        
        public function get enabled():Boolean {
            return _enabled;
        }
        
        public function set enabled(en:Boolean):void {
            if (en != _enabled) {
                _enabled = en;
                resizeHandle.visible = en;
            }
        }
        
        /**        
         * Returns the resizeHandle UIComponent.
         */
        public function get resizeHandle():UIComponent {
            if (_resizeHandle == null) {
                _resizeHandle = new UIComponent();
                _resizeHandle.mouseEnabled = true;
                _resizeHandle.addEventListener(MouseEvent.MOUSE_DOWN, resizeHandler);
                _resizeHandle.width = RESIZE_HANDLE_SIZE;
                _resizeHandle.height = RESIZE_HANDLE_SIZE;
                _resizeHandle.toolTip = "Drag this handle to resize the component";
            }
            return _resizeHandle;
        }
        
        /**
         * Checks if the horizontal and/or vertical scrollbars are showing, if so it resizes
         * them to make sure the resize handle isn't covered up.
         * If the component is a ScrollControlBase, then you have to pass in the scrollbars
         * since they are protected properties.
         */
        public function adjustScrollBars(hScroll:ScrollBar, vScroll:ScrollBar):void {
            if (enabled) {
                // keep the resize handle on top, also adds it to the parent
                moveResizeHandleOnTop();
                
                // make room for the resize handle, only needed if one scrollbar is showing
                var hScrollShowing:Boolean = hScroll && hScroll.visible;
                var vScrollShowing:Boolean = vScroll && vScroll.visible;
                if (hScrollShowing && vScrollShowing) {
                    // do nothing, there is already a white square between the ends of the scrollbars
                    // where the resize handle is, so no need to resize the scrollbars
                } else if (hScrollShowing) {
                    // important - use setActualSize instead of the width/height properties otherwise
                    // we get into an endless loop
                    hScroll.setActualSize(Math.max(hScroll.minWidth, hScroll.width - resizeHandle.width), hScroll.height);
                } else if (vScrollShowing) {
                    vScroll.setActualSize(vScroll.width, Math.max(vScroll.minHeight, vScroll.height - resizeHandle.height));
                }
             }
        }
        
        /**
         * Positions the resize handle in the bottom right corner of the parent container.
         * @param parentW the parent container's width
         * @param parentH the parent container's height
         */
        private function positionResizeHandle(parentW:Number, parentH:Number):void {
            if (enabled && (parentW >= resizeHandle.width) && (parentH >= resizeHandle.height)) {
                var newX:Number = parentW - resizeHandle.width;
                var newY:Number = parentH - resizeHandle.height;
                if ((newX != resizeHandle.x) || (newY != resizeHandle.y)) {
                    resizeHandle.move(newX, newY);
                    repaint = true;
                }
                if (!resizeHandle.visible) {
                    resizeHandle.visible = true;
                    repaint = true;
                }
            } else {
                resizeHandle.visible = false;
            }
        }
        
        /**
         * Draws the resize handle in the bottom right corner of the parent container.
         * @param parentW the parent container's width
         * @param parentH the parent container's height
         * @param color the color for the resize handle
         */
        public function drawResizeHandle(parentW:Number, parentH:Number, color:uint = 0x666666, alpha:Number = 1):void {
            // Draw resize handle
            if (enabled && (parentW >= resizeHandle.width) && (parentH >= resizeHandle.height)) {
                // keep the resize handle on top, also adds it to the parent
                moveResizeHandleOnTop();
                
                // ensure that the resize handle is correctly positioned in the bottom right corner
                positionResizeHandle(parentW, parentH);
                
                if (repaint || (color != lastColor) || (alpha != lastAlpha)) {
                    repaint = false;
                    lastColor = color;
                    lastAlpha = alpha;
                    var g:Graphics = resizeHandle.graphics;
                    g.clear();
                    
                    var offset:int = 4;
                    // for mouse dragging only, draw a transparent triangle around the handle
                    var bgAlpha:Number = 0;
                    drawResizeArea(g, color, bgAlpha, 0, 0, resizeHandle.width - 1, resizeHandle.height - 1);
                    
                    // now draw the resize handle dots (6 dots making up a triangle)
                    drawResizeDot(g, color, alpha, offset,     offset + 8);
                    drawResizeDot(g, color, alpha, offset + 4, offset + 8);
                    drawResizeDot(g, color, alpha, offset + 8, offset + 8);
                    drawResizeDot(g, color, alpha, offset + 4, offset + 4);
                    drawResizeDot(g, color, alpha, offset + 8, offset + 4);
                    drawResizeDot(g, color, alpha, offset + 8, offset);
                }                
            } else {
                resizeHandle.visible = false;
            }
        }

        /**
         * Makes sure that the resizeHandle has been added to the parent, and also makes sure it is 
         * the last item in the child list.
         */
        private function moveResizeHandleOnTop():void {
            var children:IChildList = (parent is Container ? (parent as Container).rawChildren : parent);
            var index:int = (resizeHandle.parent != null ? children.getChildIndex(resizeHandle) : -1); 
            if (index != (children.numChildren - 1)) { 
                // make sure the resize handle is on top
                if (index == -1) {
                    children.addChild(resizeHandle);
                } else {
                    children.setChildIndex(resizeHandle, children.numChildren - 1);
                }
                repaint = true;
            }
        }
        
        /**
          * Draws a triangle region around the resize handle.
          * This makes it so that the mouse down event works properly.
          * @param color the color for the background 
          * @param xx the x position of the resize handle
         * @param yy the y position of the resize handle
         * @param w the width of the resize handle
         * @param h the height of the resize handle
         */
        private function drawResizeArea(g:Graphics, color:uint, alpha:Number, 
                            xx:Number, yy:Number, w:Number, h:Number):void {
            // no border
            g.lineStyle(0, 0, 0);
            // fill the background, set alpha=0 to make it transparent
            g.beginFill(color, alpha);
            // draw a triangle
            g.moveTo(xx, yy + h);
            g.lineTo(xx + w, yy + h);
            g.lineTo(xx + w, yy);
            g.lineTo(xx, yy + h);
            g.endFill();
        }
        
        /**
         * Draws a single resize dot, defaults to a 2x2 rectangle.
         * @param color the color for the resize dot
         * @param xx the x position for the dot
         * @param yy the y position for the dot
         * @param w the width of the dot (defaults to 2)
         * @param h the height of dot (defaults to 2)
         */
        private function drawResizeDot(g:Graphics, color:uint, alpha:Number, 
                            xx:Number, yy:Number, w:Number = 2, h:Number = 2):void {
            // no border
            g.lineStyle(0, 0, 0);
            // fill the dot
            g.beginFill(color, alpha);
            g.drawRect(xx, yy, w, h);
            g.endFill();
        }
        
        // Resize event handler
        private function resizeHandler(event:MouseEvent):void {
            if (enabled) {
                startResize(event.stageX, event.stageY);
            }
        }    

        private function startResize(globalX:Number, globalY:Number):void {
            resizeInitX = globalX;
            resizeInitY = globalY;
            
            // Add event handlers so that the SystemManager handles the mouseMove and mouseUp events. 
            // Set useCapure flag to true to handle these events 
            // during the capture phase so no other component tries to handle them.
            parent.systemManager.addEventListener(MouseEvent.MOUSE_MOVE, resizeMouseMoveHandler, true);
            parent.systemManager.addEventListener(MouseEvent.MOUSE_UP, resizeMouseUpHandler, true);
        }
        
        /**
         * Resizes this panel as the user moves the mouse with the mouse button down.
         * Also restricts the width and height based on the parent's minWidth, maxWidth, minHeight, and
         * maxHeight properties.
         */
        private function resizeMouseMoveHandler(event:MouseEvent):void {
            event.stopImmediatePropagation();
            
            var newWidth:Number = parent.width + event.stageX - resizeInitX; 
            var newHeight:Number = parent.height + event.stageY - resizeInitY;
            
            // restrict the width/height
            if ((newWidth >= parent.minWidth) && (newWidth <= parent.maxWidth)) {
                parent.width = newWidth;
            }
            if ((newHeight >= parent.minHeight) && (newHeight <= parent.maxHeight)) {
                parent.height = newHeight;
            }
            
            resizeInitX = event.stageX;
            resizeInitY = event.stageY;
            
            if (parent.parent.width < parent.x + parent.width) parent.x = parent.parent.width - parent.width;
        	if (parent.parent.height< parent.y + parent.height)parent.y = parent.parent.height- parent.height;
        	if (parent.x < 0) parent.x = 0;
        	if (parent.y < 0) parent.y = 0;
        }
        
        /** 
         * Removes the event handlers from the SystemManager.
         */
        private function resizeMouseUpHandler(event:MouseEvent):void {
            event.stopImmediatePropagation();
            parent.systemManager.removeEventListener(MouseEvent.MOUSE_MOVE, resizeMouseMoveHandler, true);
            parent.systemManager.removeEventListener(MouseEvent.MOUSE_UP, resizeMouseUpHandler, true);
        }

    }
}