package org.bigbluebutton.modules.deskShare.view.components
{
    import flash.display.Graphics;
    import flash.events.Event;
    import flash.events.MouseEvent;
    
    import mx.controls.Button;
    import mx.core.UIComponent;

    /**
     * Similar to the ResizeManager, this class adds support for moving a component by dragging it
     * with the mouse. 
     * 
     * @author Chris Callendar
     * @date March 17th, 2009
     */ 
    public class MoveManager
    {
        
        private const MOVE_HANDLE_WIDTH:int = 6;
        private const MOVE_HANDLE_HEIGHT:int = 14;
        
        private var _moveHandle:UIComponent;
        
        // the component that is being moved
        private var moveComponent:UIComponent;
        // the component that when dragged causes the above component to move
        private var dragComponent:UIComponent;
        // the component that the move handle is added to
        private var moveHandleParent:UIComponent;
        
        private var dragging:Boolean;
        private var _enabled:Boolean;
        
        public function MoveManager() {
            dragging = false;
            _enabled = true;
        }
        
        public function get enabled():Boolean {
            return _enabled;
        }
        
        public function set enabled(en:Boolean):void {
            if (en != _enabled) {
                _enabled = en;
                moveHandle.visible = en;
            }
        }
        
        /**
         * Adds support for moving a component.
         * @param moveComponent the component that will have its x and y values changed
         * @param dragComponent the component that will have a mouse_down listener added to listen
         *  for when the user drags it.  If null then the moveComponent is used instead.
         * @param moveHandleParent the parent component which will have the move handle added to it.
         *  If null then it is added to the moveComponent. 
         */
        public function addMoveSupport(moveComponent:UIComponent, dragComponent:UIComponent = null, 
                                       moveHandleParent:UIComponent = null):void {
            this.moveComponent = moveComponent;
            this.dragComponent = dragComponent;
            this.moveHandleParent = moveHandleParent;
            
            if (moveHandleParent) {
                moveHandleParent.addChildAt(moveHandle, 0);
            } else if (moveComponent) {
                moveComponent.addChildAt(moveHandle, 0);
            }
            if (dragComponent) {
                dragComponent.addEventListener(MouseEvent.MOUSE_DOWN, dragComponentMouseDown);
            } else if (moveComponent) {
                moveComponent.addEventListener(MouseEvent.MOUSE_DOWN, dragComponentMouseDown);
            }
        }

        /**
         * Removes move support, removes the mouse listener and the move handle.
         */ 
        public function removeMoveSupport():void {
            if (dragComponent) {
                dragComponent.removeEventListener(MouseEvent.MOUSE_DOWN, dragComponentMouseDown);
            } else if (moveComponent) {
                moveComponent.removeEventListener(MouseEvent.MOUSE_DOWN, dragComponentMouseDown);
            }
            if (moveHandleParent) {
                moveHandleParent.removeChild(moveHandle);
            } else if (moveComponent) {
                //moveComponent.removeChild(moveHandle);
            }
        }

        /**
         * Returns the move handle component.
         */
        public function get moveHandle():UIComponent {
            if (_moveHandle == null) {
                _moveHandle = new UIComponent();
                _moveHandle.width = MOVE_HANDLE_WIDTH;
                _moveHandle.height = MOVE_HANDLE_HEIGHT;
            }
            return _moveHandle;
        }
        
        /**
         * Draws a 6x14 move/drag handle.
         */
        public function drawMoveHandle(parentW:Number, parentH:Number, color:uint = 0x666666, alpha:Number = 1):void {
            if (enabled) {
                var g:Graphics = moveHandle.graphics;
                g.clear();
                var xx:int = 2;
                var yy:int = 2;
                for (var i:int = 0; i < 4; i++) {
                    drawDot(g, color, alpha, xx, yy + (i * 4));
                    //drawDot(g, color, alpha, xx + 4, yy + (i * 4));
                }
            }
        }
        
        /**
         * Draws a single (2x2) dot.
         */
        private function drawDot(g:Graphics, color:uint, alpha:Number, xx:Number, yy:Number, w:Number = 2, h:Number = 2):void {
            g.lineStyle(0, 0, 0);
            g.beginFill(color, alpha);
            g.drawRect(xx, yy, w, h);
            g.endFill();
        }
        
        /**
         * This function gets called when the user presses down the mouse button on the
         * dragComponent (or if not specified then the moveComponent).
         * It starts the drag process.
         */
        private function dragComponentMouseDown(event:MouseEvent):void {
            if (!enabled) {
                return;
            }
            // special case - ignore if the target is a button (e.g. close button)
            if (event.target is Button) {
                return;
            }

            // move above all others
            if (moveComponent.parent) {
                var index:int = moveComponent.parent.getChildIndex(moveComponent);
                var last:int = moveComponent.parent.numChildren - 1;
                if (index != last) {
                    moveComponent.parent.setChildIndex(moveComponent, last);
                }
            }

            moveComponent.startDrag();
            moveComponent.systemManager.addEventListener(MouseEvent.MOUSE_MOVE, dragComponentMove);
            moveComponent.systemManager.addEventListener(MouseEvent.MOUSE_UP, dragComponentMouseUp);
            moveComponent.systemManager.stage.addEventListener(Event.MOUSE_LEAVE, dragComponentMouseUp);
        }

        private function dragComponentMove(event:MouseEvent):void {
            if (!dragging) {
                dragging = true;
                moveComponent.clearStyle("top");
                moveComponent.clearStyle("right");
                moveComponent.clearStyle("bottom");
                moveComponent.clearStyle("left");
                moveComponent.dispatchEvent(new Event("dragStart"));
            }
            moveComponent.dispatchEvent(new Event("drag"));
            
        	if (moveComponent.parent.width < moveComponent.x + moveComponent.width) moveComponent.x = moveComponent.parent.width - moveComponent.width;
        	if (moveComponent.parent.height< moveComponent.y + moveComponent.height)moveComponent.y = moveComponent.parent.height- moveComponent.height;
        	if (moveComponent.x < 0) moveComponent.x = 0;
        	if (moveComponent.y < 0) moveComponent.y = 0;
        }
        
        private function dragComponentMouseUp(event:Event):void {
            moveComponent.stopDrag();
            if (dragging) {
                dragging = false;
                moveComponent.dispatchEvent(new Event("dragEnd"));
            }
            moveComponent.systemManager.removeEventListener(MouseEvent.MOUSE_MOVE, dragComponentMove);
            moveComponent.systemManager.removeEventListener(MouseEvent.MOUSE_UP, dragComponentMouseUp);
            moveComponent.systemManager.stage.removeEventListener(Event.MOUSE_LEAVE, dragComponentMouseUp);
        }    

    }
}