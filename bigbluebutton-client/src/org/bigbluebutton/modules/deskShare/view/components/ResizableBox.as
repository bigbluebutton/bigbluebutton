/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 */
package org.bigbluebutton.modules.deskShare.view.components
{
    import flash.events.MouseEvent;
    
    import mx.containers.Box;
    import mx.containers.BoxDirection;
    import mx.styles.CSSStyleDeclaration;
    import mx.styles.StyleManager;
    
    
    /**
     *  The alpha value for the resize handle.
     *  @default 0x666666
     */
    [Style(name="resizeHandleColor", type="Color", inherit="no")]

    /**
     *  The alpha value for the resize handle.
     *  @default 1
     */
    [Style(name="resizeHandleAlpha", type="Number", inherit="no")]

    /**
     * Extends the Box class to let the user resize the box by dragging on a small
     * 16x16 resize handle in the bottom right corner of the box.
     * 
     * See the ResizeManager class for more details.
     * 
     * You can also specify the minWidth, minHeight, maxWidth, and maxHeight properties
     * to restrict the size of the box.
     * 
     *  <pre>
      *  &lt;ResizableBox
     *   <strong>Styles</strong>
     *   resizeHandleColor="0x666666"
     *   resizeHandleAlpha="1"
     * &gt;
      *      ...
      *      <i>child tags</i>
      *      ...
      *  &lt;/ui:ResizableBox&gt;
      *  </pre>
      * 
     * @author Chris Callendar
     * @date March 17th, 2009
     */
    public class ResizableBox extends Box
    {
        // setup the default styles
        private static var classConstructed:Boolean = classConstruct(); 
        private static function classConstruct():Boolean {
            var style:CSSStyleDeclaration = StyleManager.getStyleDeclaration("ResizableBox"); 
            if (!style) {
                style = new CSSStyleDeclaration();
            }
            style.defaultFactory = function():void {
                this.resizeHandleColor = 0x666666;
                this.resizeHandleAlpha = 1;
                this.resizeHandleColor = 0x00ff00;
           		this.backgroundColor = 0xddffdd;
            	this.backgroundAlpha = 0.3;
            	this.borderThickness = 1;
            	this.borderStyle = "solid";
            	this.borderColor = 0x000000;
            };
            StyleManager.setStyleDeclaration("ResizableBox", style, true);
            return true;
        };
                
        private var resizeManager:ResizeManager;
        private var moveManager:MoveManager;
        
        public function ResizableBox() {
            super();
            this.resizeManager = new ResizeManager(this);
            this.moveManager = new MoveManager();
            this.moveManager.addMoveSupport(this,null,null);
            this.resizeManager.resizeHandle.addEventListener(MouseEvent.MOUSE_OVER, onMouseOverResizeHandle);
            this.resizeManager.resizeHandle.addEventListener(MouseEvent.MOUSE_OUT, onMouseOutResizeHandle);
            
            direction = BoxDirection.VERTICAL;
            // set a minimum size for this box
            minWidth = 24;
            minHeight = 24;
        }
        
        public function onMouseOverResizeHandle(e:MouseEvent):void{
        	this.moveManager.removeMoveSupport();
        }
        
        public function onMouseOutResizeHandle(e:MouseEvent):void{
        	this.moveManager.addMoveSupport(this, null, null);
        }
        
        [Inspectable(category="Common")]
        public function get resizable():Boolean {
            return resizeManager.enabled;
        }
        
        public function set resizable(resize:Boolean):void {
            resizeManager.enabled = resize;
        }
        
        override public function styleChanged(styleProp:String):void {
            super.styleChanged(styleProp);

            if ((styleProp == "resizeHandleColor") || (styleProp == "resizeHandleAlpha")) {
                invalidateDisplayList();
            }
        }
            
        override protected function updateDisplayList(w:Number, h:Number):void {
            super.updateDisplayList(w, h);
            
            // Draw resize handle
            var color:uint = uint(getStyle("resizeHandleColor"));
            var alpha:Number = Number(getStyle("resizeHandleAlpha"));
            resizeManager.drawResizeHandle(w, h, color, alpha);
        }
        
        override public function validateDisplayList():void {
            super.validateDisplayList();
            // prevent the scrollbars from covering up the resize handle
            if (horizontalScrollBar || verticalScrollBar) {
                resizeManager.adjustScrollBars(horizontalScrollBar, verticalScrollBar);
            }
        }
        
    }
}