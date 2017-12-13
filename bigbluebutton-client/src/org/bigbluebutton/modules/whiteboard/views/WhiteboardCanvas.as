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
	
	import com.asfusion.mate.events.Dispatcher;
	import com.asfusion.mate.events.Listener;
	
	import flash.display.DisplayObject;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.geom.Point;
	
	import mx.containers.Canvas;
	import mx.managers.CursorManager;
	
	import org.bigbluebutton.main.events.UserLeftEvent;
	import org.bigbluebutton.modules.whiteboard.WhiteboardCanvasDisplayModel;
	import org.bigbluebutton.modules.whiteboard.WhiteboardCanvasModel;
	import org.bigbluebutton.modules.whiteboard.business.shapes.TextObject;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardAccessEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardButtonEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardCursorEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardDrawEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardUpdateReceived;
	import org.bigbluebutton.modules.whiteboard.models.Annotation;
	import org.bigbluebutton.modules.whiteboard.models.AnnotationType;
	import org.bigbluebutton.modules.whiteboard.models.WhiteboardModel;
	
	public class WhiteboardCanvas extends Canvas {
		private var whiteboardModel:WhiteboardModel;
		private var canvasModel:WhiteboardCanvasModel;
		private var canvasDisplayModel:WhiteboardCanvasDisplayModel;
		private var whiteboardToolbar:WhiteboardToolbar;
		private var textToolbar:WhiteboardTextToolbar;
		
		private var graphicObjectHolder:Canvas = new Canvas();
		private var cursorObjectHolder:Canvas = new Canvas();
		
		private var toolType:String = AnnotationType.PENCIL;
		private var whiteboardEnabled:Boolean = false;
		private var currentWhiteboardId:String;
		
		private var dispatcher:Dispatcher = new Dispatcher();
		
		public function WhiteboardCanvas(wbModel:WhiteboardModel):void {
			whiteboardModel = wbModel;
			
			canvasModel = new WhiteboardCanvasModel();
			canvasDisplayModel = new WhiteboardCanvasDisplayModel();
			
			//set up model cross dependencies
			canvasModel.setDependencies(this);
			canvasDisplayModel.setDependencies(this, wbModel);
			
			whiteboardToolbar = new WhiteboardToolbar();
			whiteboardToolbar.setCanvas(this);
			
			textToolbar = new WhiteboardTextToolbar();
			textToolbar.canvas = this;
			
			this.clipContent = true;
			this.mouseEnabled = false;
			
			//create the annotation display container
			this.addChild(graphicObjectHolder);
			graphicObjectHolder.x = 0;
			graphicObjectHolder.y = 0;
			graphicObjectHolder.tabFocusEnabled = false;
			
			//create the cursor display container
			this.addChild(cursorObjectHolder);
			cursorObjectHolder.x = 0;
			cursorObjectHolder.y = 0;
			cursorObjectHolder.tabFocusEnabled = false;
			
			wbModel.addEventListener(WhiteboardUpdateReceived.NEW_ANNOTATION, onNewAnnotationEvent);
			wbModel.addEventListener(WhiteboardUpdateReceived.RECEIVED_ANNOTATION_HISTORY, onReceivedAnnotationsHistory);
			wbModel.addEventListener(WhiteboardUpdateReceived.CLEAR_ANNOTATIONS, onClearAnnotations);
			wbModel.addEventListener(WhiteboardUpdateReceived.UNDO_ANNOTATION, onUndoAnnotation);
			wbModel.addEventListener(WhiteboardAccessEvent.MODIFIED_WHITEBOARD_ACCESS, onModifiedAccess);
			wbModel.addEventListener(WhiteboardCursorEvent.RECEIVED_CURSOR_POSITION, onReceivedCursorPosition);
			
			whiteboardToolbar.addEventListener(WhiteboardButtonEvent.ENABLE_WHITEBOARD, onEnableWhiteboardEvent);
			whiteboardToolbar.addEventListener(WhiteboardButtonEvent.DISABLE_WHITEBOARD, onDisableWhiteboardEvent);
			whiteboardToolbar.addEventListener(WhiteboardAccessEvent.MODIFY_WHITEBOARD_ACCESS, onMultiUserBtn);

			var ull:Listener = new Listener();
			ull.type = UserLeftEvent.LEFT;
			ull.method = onUserLeftEvent;
		}
		
		public function attachToReceivingObject(ro:IWhiteboardReceiver):void {
			ro.receiveCanvas(this);
			ro.receiveToolbars(whiteboardToolbar, textToolbar);
		}
		
		private function registerForMouseEvents():void {
			addEventListener(MouseEvent.MOUSE_DOWN, doMouseDown);
			addEventListener(MouseEvent.MOUSE_OVER, onMouseOver);
			addEventListener(MouseEvent.MOUSE_OUT, onMouseOut);
			mouseEnabled = true;
		}
		
		private function unregisterForMouseEvents():void {
			removeEventListener(MouseEvent.MOUSE_DOWN, doMouseDown);
			removeEventListener(MouseEvent.MOUSE_OVER, onMouseOver);
			removeEventListener(MouseEvent.MOUSE_OUT, onMouseOut);
			mouseEnabled = false;
		}
		
		private function doMouseUp(event:MouseEvent):void {
			var mousePoint:Point = getMouseXY();
			canvasModel.doMouseUp(mousePoint.x, mousePoint.y);
			
			stage.removeEventListener(MouseEvent.MOUSE_UP, doMouseUp);
			stage.removeEventListener(MouseEvent.MOUSE_MOVE, doMouseMove);
		}
		
		private function doMouseDown(event:MouseEvent):void {
			canvasModel.doMouseDown(this.mouseX, this.mouseY, currentWhiteboardId);
			canvasDisplayModel.doMouseDown(this.mouseX, this.mouseY);
			event.stopPropagation(); // we want to stop the bubbling so slide doesn't move
			
			stage.addEventListener(MouseEvent.MOUSE_UP, doMouseUp);
			stage.addEventListener(MouseEvent.MOUSE_MOVE, doMouseMove);	
		}
		
		private function doMouseMove(event:MouseEvent):void {
			var mousePoint:Point = getMouseXY();
			canvasModel.doMouseMove(mousePoint.x, mousePoint.y);
		}
		
		private function stopDrawing():void {
			var mousePoint:Point = getMouseXY();
			
			canvasDisplayModel.doMouseDown(mousePoint.x, mousePoint.y);
			canvasModel.stopDrawing(mousePoint.x, mousePoint.y);
		}
		
		public function changeColor(color:uint):void {
			canvasModel.changeColor(color);
		}
		
		public function isEditingText():Boolean {
			return canvasDisplayModel.isEditingText();
		}
		
		public function sendGraphicToServer(gobj:Annotation):void {
			// LogUtil.debug("DISPATCHING SEND sendGraphicToServer [" + type + "]");
			var event:WhiteboardDrawEvent = new WhiteboardDrawEvent(WhiteboardDrawEvent.SEND_SHAPE);
			event.annotation = gobj;
			dispatcher.dispatchEvent(event);
		}
		
		public function sendUndoToServer():void {
			var event:WhiteboardDrawEvent = new WhiteboardDrawEvent(WhiteboardDrawEvent.UNDO);
			event.wbId = currentWhiteboardId;
			dispatcher.dispatchEvent(event);
		}
		
		public function sendClearToServer():void {
			var event:WhiteboardDrawEvent = new WhiteboardDrawEvent(WhiteboardDrawEvent.CLEAR);
			event.wbId = currentWhiteboardId;
			dispatcher.dispatchEvent(event);			
		}
		
		public function sendCursorPositionToServer(x:Number, y:Number):void {
			var event:WhiteboardCursorEvent = new WhiteboardCursorEvent(WhiteboardCursorEvent.SEND_CURSOR_POSITION);
			event.xPercent = x;
			event.yPercent = y;
			event.whiteboardId = currentWhiteboardId;
			dispatcher.dispatchEvent(event);
		}
		
		public function setGraphicType(type:String):void {
			if (canvasModel == null) return;
			canvasModel.setGraphicType(type);
		}
		
		public function setTool(s:String):void {
			if (canvasModel == null) return;
			canvasModel.setTool(s);
			toolType = s;
		}
		
		public function changeThickness(val:Number):void {
			canvasModel.changeThickness(val);
		}
		
		private function setWhiteboardInteractable():void {
			if (this.whiteboardEnabled) {
				registerForMouseEvents();
			} else {
				unregisterForMouseEvents();
			}
		}
		
		private function onMouseOver(e:MouseEvent):void {
			setCursor(toolType);
		}
		
		private function onMouseOut(e:MouseEvent):void {
			removeCursor();
		}
		
		private function setCursor(toolType:String):void {
			if(toolType == AnnotationType.ELLIPSE) {
				CursorManager.setCursor(getStyle("iconEllipse"));
			} else if(toolType == AnnotationType.RECTANGLE) {
				CursorManager.setCursor(getStyle("iconRectangle"));
			} else if(toolType == AnnotationType.TRIANGLE) {
				CursorManager.setCursor(getStyle("iconTriangle"));
			} else if(toolType == AnnotationType.PENCIL) {
				CursorManager.setCursor(getStyle("iconPencil"), 2, -2, -22);
			} else if(toolType == AnnotationType.LINE) {
				CursorManager.setCursor(getStyle("iconLine"));
			} else if(toolType == AnnotationType.TEXT) {
				CursorManager.setCursor(getStyle("iconText"));
			} 
		}
		
		private function removeCursor():void {
			if (CursorManager.currentCursorID != CursorManager.NO_CURSOR) {
				CursorManager.removeCursor(CursorManager.currentCursorID);
			}
		}
		
		private function getMouseXY():Point {
			if (parent) {
				return new Point(Math.min(Math.max(parent.mouseX, 0), parent.width-1) - this.x, Math.min(Math.max(parent.mouseY, 0), parent.height-1) - this.y);
			} else {
				return new Point(0, 0);
			}
		}
		
		public function presenterChange(amIPresenter:Boolean, presenterId:String):void {
			canvasModel.presenterChange(amIPresenter, presenterId);
			canvasDisplayModel.presenterChange(amIPresenter, presenterId);
			whiteboardToolbar.presenterChange(amIPresenter);
			textToolbar.presenterChange(amIPresenter);
		}
		
		public function doesContainGraphic(child:DisplayObject):Boolean {
			return this.graphicObjectHolder.rawChildren.contains(child);
		}
		
		public function removeGraphic(child:DisplayObject):void {
			if (doesContainGraphic(child)) this.graphicObjectHolder.rawChildren.removeChild(child);
			else trace("Does not contain");
		}
		
		public function addGraphic(child:DisplayObject):void {
			this.graphicObjectHolder.rawChildren.addChild(child);
		}
		
		public function getGraphicByName(childName:String):DisplayObject {
			return this.graphicObjectHolder.rawChildren.getChildByName(childName);
		}
		
		private function doesContainCursor(cursor:DisplayObject):Boolean {
			return this.cursorObjectHolder.rawChildren.contains(cursor);
		}
		
		public function addCursor(cursor:DisplayObject):void {
			this.cursorObjectHolder.rawChildren.addChild(cursor);
		}
		
		public function removeCursorChild(cursor:DisplayObject):void {
			if (doesContainCursor(cursor)) this.cursorObjectHolder.rawChildren.removeChild(cursor);
		}
		
		public function textToolbarSyncProxy(tobj:TextObject):void {
			textToolbar.syncPropsWith(tobj);
		}
		
		public function moveCanvas(x:Number, y:Number):void {
			this.x = x;
			this.y = y;
		}
		
		public function zoomCanvas(width:Number, height:Number):void {
			graphicObjectHolder.width = width;
			graphicObjectHolder.height = height;
			cursorObjectHolder.width = width;
			cursorObjectHolder.height = height;
			this.width = width;
			this.height = height;	
			canvasDisplayModel.zoomCanvas(width, height);
			canvasModel.zoomCanvas(width, height);
			textToolbar.adjustForZoom(width, height);
		}
		
		public function displayWhiteboardById(wbId:String):void {
			stopDrawing();
			
			currentWhiteboardId = wbId;
			canvasDisplayModel.changeWhiteboard(wbId);
			whiteboardToolbar.whiteboardIdSet();
			
			var multiUser:Boolean = whiteboardModel.getMultiUser(wbId);
			whiteboardToolbar.whiteboardAccessModified(multiUser);
			canvasModel.multiUserChange(multiUser);
		}
		
		public function getMultiUserState():Boolean {
			return whiteboardModel.getMultiUser(currentWhiteboardId);
		}
		
		private function onNewAnnotationEvent(e:WhiteboardUpdateReceived):void {
			if (e.annotation.whiteboardId == currentWhiteboardId) {
				canvasDisplayModel.drawGraphic(e.annotation);
			}
		}
		
		private function onClearAnnotations(e:WhiteboardUpdateReceived):void {
			if (e.wbId == currentWhiteboardId || e.wbId == "all") {
				canvasDisplayModel.clearBoard(e.userId);
			}
		}
		
		private function onReceivedAnnotationsHistory(e:WhiteboardUpdateReceived):void {
			if (e.wbId == currentWhiteboardId) {
				canvasDisplayModel.receivedAnnotationsHistory(e.wbId);
			}
		}
		
		private function onUndoAnnotation(e:WhiteboardUpdateReceived):void {
			if (e.annotation.whiteboardId == currentWhiteboardId) {
				canvasDisplayModel.undoAnnotation(e.annotation);
			}
		}
		
		private function onModifiedAccess(e:WhiteboardAccessEvent):void {
			if (e.whiteboardId == currentWhiteboardId) {
				whiteboardToolbar.whiteboardAccessModified(e.multiUser);
				canvasModel.multiUserChange(e.multiUser);
			}
		}
		
		private function onReceivedCursorPosition(e:WhiteboardCursorEvent):void {
			if (e.whiteboardId == currentWhiteboardId) {
				canvasDisplayModel.drawCursor(e.userId, e.xPercent, e.yPercent);
			}
		}
		
		private function onEnableWhiteboardEvent(e:WhiteboardButtonEvent):void {
			e.stopPropagation();
			
			this.whiteboardEnabled = true;
			setWhiteboardInteractable();
		}
		
		private function onDisableWhiteboardEvent(e:WhiteboardButtonEvent):void {
			e.stopPropagation();
			
			stopDrawing();
			
			removeCursor();
			
			this.whiteboardEnabled = false;
			setWhiteboardInteractable();
		}
		
		private function onMultiUserBtn(e:WhiteboardAccessEvent):void {
			var newEvent:WhiteboardAccessEvent = new WhiteboardAccessEvent(WhiteboardAccessEvent.MODIFY_WHITEBOARD_ACCESS);
			newEvent.multiUser = e.multiUser;
			newEvent.whiteboardId = currentWhiteboardId;
			dispatcher.dispatchEvent(newEvent);
		}

		private function onUserLeftEvent(e:UserLeftEvent):void {
			canvasDisplayModel.userLeft(e.userID);
		}
	}
}
