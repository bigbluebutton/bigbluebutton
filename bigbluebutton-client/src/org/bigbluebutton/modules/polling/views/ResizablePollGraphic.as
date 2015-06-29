/**
 * Copyright (c) 2007 FlexLib Contributors.  See:
 * http://code.google.com/p/flexlib/wiki/ProjectContributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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

/**
 * This class uses the basic resizing portions of the MDIWindow class contained in 
 * the Flexlib library. Portions on the code in this file fall under their license.
 */

package org.bigbluebutton.modules.polling.views
{
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.geom.Rectangle;
	
	import mx.containers.Canvas;
	import mx.core.UIComponent;
	import mx.managers.CursorManager;

	public class ResizablePollGraphic extends PollGraphic {
		private const RESIZE_BUTTON_ALPHA:Number = 0;
		
		[Embed(source = "assets/resizeCursorH.gif")]
		private const resizeCursorHorizontalSkin:Class;
		private const resizeCursorHorizontalXOffset:Number = -10;
		private const resizeCursorHorizontalYOffset:Number = -10;
		
		[Embed(source = "assets/resizeCursorV.gif")]
		private const resizeCursorVerticalSkin:Class;
		private const resizeCursorVerticalXOffset:Number = -10;
		private const resizeCursorVerticalYOffset:Number = -10;
		
		[Embed(source = "assets/resizeCursorTLBR.gif")]
		private const resizeCursorTopLeftBottomRightSkin:Class;
		private const resizeCursorTopLeftBottomRightXOffset:Number = -10;
		private const resizeCursorTopLeftBottomRightYOffset:Number = -10;
		
		[Embed(source = "assets/resizeCursorTRBL.gif")]
		private const resizeCursorTopRightBottomLeftSkin:Class;
		private const resizeCursorTopRightBottomLeftXOffset:Number = -10;
		private const resizeCursorTopRightBottomLeftYOffset:Number = -10;
		
		
		public var edgeHandleSize:Number = 4;
		public var cornerHandleSize:Number = 10;
		
		private var resizeHandleTop:Canvas;
		private var resizeHandleRight:Canvas;
		private var resizeHandleBottom:Canvas;
		private var resizeHandleLeft:Canvas;
		private var resizeHandleTL:Canvas;
		private var resizeHandleTR:Canvas;
		private var resizeHandleBR:Canvas;
		private var resizeHandleBL:Canvas;
		private var currentResizeHandle:String;
		
		private var dragStartMouseX:Number;
		private var dragStartMouseY:Number;
		
		private var dragMaxX:Number;
		private var dragMaxY:Number;
		
		private var dragAmountX:Number;
		private var dragAmountY:Number;
		
		private var _resizing:Boolean;
		
		public var savedWindowRect:Rectangle;
		
		public var objectToMove:UIComponent;
		
		
		public function ResizablePollGraphic() {
			super();
			objectToMove = this;
		}
		
		/**
		 * Create resize handles and window controls.
		 */
		override protected function createChildren():void {
			super.createChildren();
			
			// edges
			if (!resizeHandleTop) {
				resizeHandleTop = new Canvas();
				resizeHandleTop.x = cornerHandleSize * .5;
				resizeHandleTop.y = -(edgeHandleSize * .5);
				resizeHandleTop.height = edgeHandleSize;
				resizeHandleTop.alpha = RESIZE_BUTTON_ALPHA;
				resizeHandleTop.focusEnabled = false;
				addChild(resizeHandleTop);
			}
			
			if (!resizeHandleRight) {
				resizeHandleRight = new Canvas();
				resizeHandleRight.y = cornerHandleSize * .5;
				resizeHandleRight.width = edgeHandleSize;
				resizeHandleRight.alpha = RESIZE_BUTTON_ALPHA;
				resizeHandleRight.focusEnabled = false;
				addChild(resizeHandleRight);
			}
			
			if (!resizeHandleBottom) {
				resizeHandleBottom = new Canvas();
				resizeHandleBottom.x = cornerHandleSize * .5;
				resizeHandleBottom.height = edgeHandleSize;
				resizeHandleBottom.alpha = RESIZE_BUTTON_ALPHA;
				resizeHandleBottom.focusEnabled = false;
				addChild(resizeHandleBottom);
			}
			
			if (!resizeHandleLeft) {
				resizeHandleLeft = new Canvas();
				resizeHandleLeft.x = -(edgeHandleSize * .5);
				resizeHandleLeft.y = cornerHandleSize * .5;
				resizeHandleLeft.width = edgeHandleSize;
				resizeHandleLeft.alpha = RESIZE_BUTTON_ALPHA;
				resizeHandleLeft.focusEnabled = false;
				addChild(resizeHandleLeft);
			}
			
			// corners
			if (!resizeHandleTL) {
				resizeHandleTL = new Canvas();
				resizeHandleTL.x = resizeHandleTL.y = -(cornerHandleSize * .3);
				resizeHandleTL.width = resizeHandleTL.height = cornerHandleSize;
				resizeHandleTL.alpha = RESIZE_BUTTON_ALPHA;
				resizeHandleTL.focusEnabled = false;
				addChild(resizeHandleTL);
			}
			
			if (!resizeHandleTR) {
				resizeHandleTR = new Canvas();
				resizeHandleTR.width = resizeHandleTR.height = cornerHandleSize;
				resizeHandleTR.alpha = RESIZE_BUTTON_ALPHA;
				resizeHandleTR.focusEnabled = false;
				addChild(resizeHandleTR);
			}
			
			if (!resizeHandleBR) {
				resizeHandleBR = new Canvas();
				resizeHandleBR.width = resizeHandleBR.height = cornerHandleSize;
				resizeHandleBR.alpha = RESIZE_BUTTON_ALPHA;
				resizeHandleBR.focusEnabled = false;
				addChild(resizeHandleBR);
			}
			
			if (!resizeHandleBL) {
				resizeHandleBL = new Canvas();
				resizeHandleBL.width = resizeHandleBL.height = cornerHandleSize;
				resizeHandleBL.alpha = RESIZE_BUTTON_ALPHA;
				resizeHandleBL.focusEnabled = false;
				addChild(resizeHandleBL);
			}
			
			addListeners();
		}
		
		/**
		 * Position and size resize handles and window controls.
		 */
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			
			// edges
			resizeHandleTop.x = cornerHandleSize * .5;
			resizeHandleTop.y = -(edgeHandleSize * .5);
			resizeHandleTop.width = this.width - cornerHandleSize;
			resizeHandleTop.height = edgeHandleSize;
			
			resizeHandleRight.x = this.width - edgeHandleSize * .5;
			resizeHandleRight.y = cornerHandleSize * .5;
			resizeHandleRight.width = edgeHandleSize;
			resizeHandleRight.height = this.height - cornerHandleSize;
			
			resizeHandleBottom.x = cornerHandleSize * .5;
			resizeHandleBottom.y = this.height - edgeHandleSize * .5;
			resizeHandleBottom.width = this.width - cornerHandleSize;
			resizeHandleBottom.height = edgeHandleSize;
			
			resizeHandleLeft.x = -(edgeHandleSize * .5);
			resizeHandleLeft.y = cornerHandleSize * .5;
			resizeHandleLeft.width = edgeHandleSize;
			resizeHandleLeft.height = this.height - cornerHandleSize;
			
			// corners
			resizeHandleTL.x = -(cornerHandleSize * .5)
				resizeHandleTL.y = -(cornerHandleSize * .5);
			resizeHandleTL.width = resizeHandleTL.height = cornerHandleSize;
			
			resizeHandleTR.x = this.width - cornerHandleSize * .5;
			resizeHandleTR.y = -(cornerHandleSize * .5);
			resizeHandleTR.width = resizeHandleTR.height = cornerHandleSize;
			
			resizeHandleBR.x = this.width - cornerHandleSize * .5;
			resizeHandleBR.y = this.height - cornerHandleSize * .5;
			resizeHandleBR.width = resizeHandleBR.height = cornerHandleSize;
			
			resizeHandleBL.x = -(cornerHandleSize * .5);
			resizeHandleBL.y = this.height - cornerHandleSize * .5;
			resizeHandleBL.width = resizeHandleBL.height = cornerHandleSize;
		}
		
		/**
		 * Add listeners for resize handles and window controls.
		 */
		private function addListeners():void {
			// edges
			resizeHandleTop.addEventListener(MouseEvent.ROLL_OVER, onResizeButtonRollOver, false, 0, true);
			resizeHandleTop.addEventListener(MouseEvent.ROLL_OUT, onResizeButtonRollOut, false, 0, true);
			resizeHandleTop.addEventListener(MouseEvent.MOUSE_DOWN, onResizeButtonPress, false, 0, true);
			
			resizeHandleRight.addEventListener(MouseEvent.ROLL_OVER, onResizeButtonRollOver, false, 0, true);
			resizeHandleRight.addEventListener(MouseEvent.ROLL_OUT, onResizeButtonRollOut, false, 0, true);
			resizeHandleRight.addEventListener(MouseEvent.MOUSE_DOWN, onResizeButtonPress, false, 0, true);
			
			resizeHandleBottom.addEventListener(MouseEvent.ROLL_OVER, onResizeButtonRollOver, false, 0, true);
			resizeHandleBottom.addEventListener(MouseEvent.ROLL_OUT, onResizeButtonRollOut, false, 0, true);
			resizeHandleBottom.addEventListener(MouseEvent.MOUSE_DOWN, onResizeButtonPress, false, 0, true);
			
			resizeHandleLeft.addEventListener(MouseEvent.ROLL_OVER, onResizeButtonRollOver, false, 0, true);
			resizeHandleLeft.addEventListener(MouseEvent.ROLL_OUT, onResizeButtonRollOut, false, 0, true);
			resizeHandleLeft.addEventListener(MouseEvent.MOUSE_DOWN, onResizeButtonPress, false, 0, true);
			
			// corners
			resizeHandleTL.addEventListener(MouseEvent.ROLL_OVER, onResizeButtonRollOver, false, 0, true);
			resizeHandleTL.addEventListener(MouseEvent.ROLL_OUT, onResizeButtonRollOut, false, 0, true);
			resizeHandleTL.addEventListener(MouseEvent.MOUSE_DOWN, onResizeButtonPress, false, 0, true);
			
			resizeHandleTR.addEventListener(MouseEvent.ROLL_OVER, onResizeButtonRollOver, false, 0, true);
			resizeHandleTR.addEventListener(MouseEvent.ROLL_OUT, onResizeButtonRollOut, false, 0, true);
			resizeHandleTR.addEventListener(MouseEvent.MOUSE_DOWN, onResizeButtonPress, false, 0, true);
			
			resizeHandleBR.addEventListener(MouseEvent.ROLL_OVER, onResizeButtonRollOver, false, 0, true);
			resizeHandleBR.addEventListener(MouseEvent.ROLL_OUT, onResizeButtonRollOut, false, 0, true);
			resizeHandleBR.addEventListener(MouseEvent.MOUSE_DOWN, onResizeButtonPress, false, 0, true);
			
			resizeHandleBL.addEventListener(MouseEvent.ROLL_OVER, onResizeButtonRollOver, false, 0, true);
			resizeHandleBL.addEventListener(MouseEvent.ROLL_OUT, onResizeButtonRollOut, false, 0, true);
			resizeHandleBL.addEventListener(MouseEvent.MOUSE_DOWN, onResizeButtonPress, false, 0, true);
		}
		
		/**
		 * Gives ResizeHandle value for a given resize handle button
		 */
		private function resizeHandleForButton(button:Canvas):String {
			if (button == resizeHandleLeft)
				return ResizeHandle.LEFT;
			else if (button == resizeHandleRight)
				return ResizeHandle.RIGHT;
			else if (button == resizeHandleTop)
				return ResizeHandle.TOP;
			else if (button == resizeHandleBottom)
				return ResizeHandle.BOTTOM;
			else if (button == resizeHandleTL)
				return ResizeHandle.TOP_LEFT;
			else if (button == resizeHandleTR)
				return ResizeHandle.TOP_RIGHT;
			else if (button == resizeHandleBL)
				return ResizeHandle.BOTTOM_LEFT;
			else if (button == resizeHandleBR)
				return ResizeHandle.BOTTOM_RIGHT;
			else
				return null;
		}
		
		/**
		 * Mouse down on any resize handle.
		 */
		private function onResizeButtonPress(event:MouseEvent):void {
			//if (windowState == BBBWindow.NORMAL && resizable) {
			currentResizeHandle = resizeHandleForButton(event.target as Canvas);
			setCursor(currentResizeHandle);
			dragStartMouseX = stage.mouseX;
			dragStartMouseY = stage.mouseY;
			savePanel();
			
			dragMaxX = savedWindowRect.x + (savedWindowRect.width - minWidth);
			dragMaxY = savedWindowRect.y + (savedWindowRect.height - minHeight);
			
			//systemManager.addEventListener(Event.ENTER_FRAME, updateWindowSize, false, 0, true);
			stage.addEventListener(MouseEvent.MOUSE_MOVE, updateWindowSize, false, 0, true);
			systemManager.addEventListener(MouseEvent.MOUSE_UP, onResizeButtonRelease, false, 0, true);
			systemManager.stage.addEventListener(Event.MOUSE_LEAVE, onMouseLeaveStage, false, 0, true);
			
			event.stopImmediatePropagation();
		}
		
		/**
		 * Mouse move while mouse is down on a resize handle
		 */
		private function updateWindowSize(event:Event):void {
			if (!_resizing) {
				_resizing = true;
				//dispatchEvent(new BBBWindowEvent(BBBWindowEvent.RESIZE_START, this));
			}
			
			dragAmountX = stage.mouseX - dragStartMouseX;
			dragAmountY = stage.mouseY - dragStartMouseY;
			//trace("currentResizeHandle: " + currentResizeHandle + " drag x-"+dragAmountX+" y-"+dragAmountY + " mouse x-"+parent.mouseX+" y-"+parent.mouseY);
			//trace("currentResizeHandle: " + currentResizeHandle + " start "+ dragStartMouseX + " mouse "+stage.mouseX+ " drag "+dragAmountX + " saved " + savedWindowRect.x + " dragMaxX " + dragMaxX + " result " + Math.min(savedWindowRect.x + dragAmountX, dragMaxX));
			if (currentResizeHandle == ResizeHandle.TOP) { // && parent.mouseY > 0) {
				objectToMove.y = Math.min(savedWindowRect.y + dragAmountY, dragMaxY);
				this.height = Math.max(savedWindowRect.height - dragAmountY, minHeight);
			} else if (currentResizeHandle == ResizeHandle.RIGHT) {// && parent.mouseX < parent.width) {
				this.width = Math.max(savedWindowRect.width + dragAmountX, minWidth);
			} else if (currentResizeHandle == ResizeHandle.BOTTOM) {// && parent.mouseY < parent.height) {
				this.height = Math.max(savedWindowRect.height + dragAmountY, minHeight);
			} else if (currentResizeHandle == ResizeHandle.LEFT) {// && parent.mouseX > 0) {
				objectToMove.x = Math.min(savedWindowRect.x + dragAmountX, dragMaxX);
				this.width = Math.max(savedWindowRect.width - dragAmountX, minWidth);
			} else if (currentResizeHandle == ResizeHandle.TOP_LEFT) {// && parent.mouseX > 0 && parent.mouseY > 0) {
				objectToMove.x = Math.min(savedWindowRect.x + dragAmountX, dragMaxX);
				objectToMove.y = Math.min(savedWindowRect.y + dragAmountY, dragMaxY);
				this.width = Math.max(savedWindowRect.width - dragAmountX, minWidth);
				this.height = Math.max(savedWindowRect.height - dragAmountY, minHeight);
			} else if (currentResizeHandle == ResizeHandle.TOP_RIGHT) {// && parent.mouseX < parent.width && parent.mouseY > 0) {
				objectToMove.y = Math.min(savedWindowRect.y + dragAmountY, dragMaxY);
				this.width = Math.max(savedWindowRect.width + dragAmountX, minWidth);
				this.height = Math.max(savedWindowRect.height - dragAmountY, minHeight);
			} else if (currentResizeHandle == ResizeHandle.BOTTOM_RIGHT) {// && parent.mouseX < parent.width && parent.mouseY < parent.height) {
				this.width = Math.max(savedWindowRect.width + dragAmountX, minWidth);
				this.height = Math.max(savedWindowRect.height + dragAmountY, minHeight);
			} else if (currentResizeHandle == ResizeHandle.BOTTOM_LEFT) {// && parent.mouseX > 0 && parent.mouseY < parent.height) {
				objectToMove.x = Math.min(savedWindowRect.x + dragAmountX, dragMaxX);
				this.width = Math.max(savedWindowRect.width - dragAmountX, minWidth);
				this.height = Math.max(savedWindowRect.height + dragAmountY, minHeight);
			}
			
			//dispatchEvent(new BBBWindowEvent(BBBWindowEvent.RESIZE, this, currentResizeHandle));
		}
		
		private function onResizeButtonRelease(event:MouseEvent = null):void {
			if (_resizing) {
				_resizing = false;
				//dispatchEvent(new BBBWindowEvent(BBBWindowEvent.RESIZE_END, this));
			}
			currentResizeHandle = null;
			//systemManager.removeEventListener(Event.ENTER_FRAME, updateWindowSize);
			stage.removeEventListener(MouseEvent.MOUSE_MOVE, updateWindowSize);
			systemManager.removeEventListener(MouseEvent.MOUSE_UP, onResizeButtonRelease);
			systemManager.stage.removeEventListener(Event.MOUSE_LEAVE, onMouseLeaveStage);
			CursorManager.removeCursor(CursorManager.currentCursorID);
		}
		
		private function onMouseLeaveStage(event:Event):void {
			onResizeButtonRelease();
			systemManager.stage.removeEventListener(Event.MOUSE_LEAVE, onMouseLeaveStage);
		}
		
		private function setCursor(resizeHandle:String):void {
			var styleStub:String;
			
			CursorManager.removeCursor(CursorManager.currentCursorID);
			
			switch (resizeHandle) {
				case ResizeHandle.RIGHT:
				case ResizeHandle.LEFT:
					styleStub = "resizeCursorHorizontal";
					CursorManager.setCursor(resizeCursorHorizontalSkin, 2, resizeCursorHorizontalXOffset, resizeCursorHorizontalYOffset);
					break;
				
				case ResizeHandle.TOP:
				case ResizeHandle.BOTTOM:
					styleStub = "resizeCursorVertical";
					CursorManager.setCursor(resizeCursorVerticalSkin, 2, resizeCursorVerticalXOffset, resizeCursorVerticalYOffset);
					break;
				
				case ResizeHandle.TOP_LEFT:
				case ResizeHandle.BOTTOM_RIGHT:
					styleStub = "resizeCursorTopLeftBottomRight";
					CursorManager.setCursor(resizeCursorTopLeftBottomRightSkin, 2, resizeCursorTopLeftBottomRightXOffset, resizeCursorTopLeftBottomRightYOffset);
					break;
				
				case ResizeHandle.TOP_RIGHT:
				case ResizeHandle.BOTTOM_LEFT:
					styleStub = "resizeCursorTopRightBottomLeft";
					CursorManager.setCursor(resizeCursorTopRightBottomLeftSkin, 2, resizeCursorTopRightBottomLeftXOffset, resizeCursorTopRightBottomLeftYOffset);
					break;
			}
			
			//var selectorList:Array = getSelectorList();
			
			//CursorManager.removeCursor(CursorManager.currentCursorID);
			//CursorManager.setCursor(Class(getStyleByPriority(selectorList, styleStub + "Skin")), 2, Number(getStyleByPriority(selectorList, styleStub + "XOffset")), Number(getStyleByPriority(selectorList, styleStub + "YOffset")));
			//CursorManager.setCursor(styleStub + "Skin", 2, styleStub + "XOffset", styleStub + "YOffset");
		}
		
		private function onResizeButtonRollOver(event:MouseEvent):void {
			// only floating windows can be resized
			// event.buttonDown is to detect being dragged over
			if (!event.buttonDown) {
				setCursor(resizeHandleForButton(event.target as Canvas));
			}
		}
		
		private function onResizeButtonRollOut(event:MouseEvent):void {
			if (!event.buttonDown) {
				CursorManager.removeCursor(CursorManager.currentCursorID);
			}
		}
		
		private function savePanel():void {
			savedWindowRect = new Rectangle(objectToMove.x, objectToMove.y, this.width, this.height);
		}
	}
}