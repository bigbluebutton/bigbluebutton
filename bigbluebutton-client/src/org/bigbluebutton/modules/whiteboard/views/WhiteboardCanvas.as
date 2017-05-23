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
	
	import mx.containers.Canvas;
	import mx.managers.CursorManager;
	
	import org.bigbluebutton.common.Images;
	import org.bigbluebutton.main.events.MadePresenterEvent;
	import org.bigbluebutton.modules.whiteboard.WhiteboardCanvasDisplayModel;
	import org.bigbluebutton.modules.whiteboard.WhiteboardCanvasModel;
	import org.bigbluebutton.modules.whiteboard.business.shapes.DrawObject;
	import org.bigbluebutton.modules.whiteboard.business.shapes.TextObject;
	import org.bigbluebutton.modules.whiteboard.commands.GetWhiteboardAccessCommand;
	import org.bigbluebutton.modules.whiteboard.commands.GetWhiteboardShapesCommand;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardAccessEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardButtonEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardDrawEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardUpdateReceived;
	import org.bigbluebutton.modules.whiteboard.models.Annotation;
	import org.bigbluebutton.modules.whiteboard.models.AnnotationType;
	import org.bigbluebutton.modules.whiteboard.models.WhiteboardModel;
	
	public class WhiteboardCanvas extends Canvas {
		private var canvasModel:WhiteboardCanvasModel;
		private var canvasDisplayModel:WhiteboardCanvasDisplayModel;
		private var whiteboardToolbar:WhiteboardToolbar;
		private var textToolbar:WhiteboardTextToolbar;
		
		private var graphicObjectHolder:Canvas = new Canvas();
		private var images:Images = new Images();
		
		[Bindable] private var pencil_icon:Class = images.pencil_icon;
		[Bindable] private var rectangle_icon:Class = images.square_icon;
		[Bindable] private var triangle_icon:Class = images.triangle_icon;
		[Bindable] private var ellipse_icon:Class = images.circle_icon;
		[Bindable] private var line_icon:Class = images.line_icon;
		[Bindable] private var text_icon:Class = images.text_icon;
		private var toolType:String = AnnotationType.PENCIL;
		private var whiteboardEnabled:Boolean = false;
		private var currentWhiteboardId:String;
		
		public function WhiteboardCanvas(wbModel:WhiteboardModel):void {
			canvasModel = new WhiteboardCanvasModel();
			canvasDisplayModel = new WhiteboardCanvasDisplayModel();
			
			//set up model cross dependencies
			canvasModel.setDependencies(this, canvasDisplayModel);
			canvasDisplayModel.setDependencies(this, wbModel);
			
			whiteboardToolbar = new WhiteboardToolbar();
			whiteboardToolbar.canvas = this;
			
			textToolbar = new WhiteboardTextToolbar();
			textToolbar.canvas = this;
			
			whiteboardToolbar.whiteboardAccessModified(wbModel.multiUser);
			
			//create the annotation display container
			this.addChild(graphicObjectHolder);
			graphicObjectHolder.x = 0;
			graphicObjectHolder.y = 0;
			graphicObjectHolder.clipContent = true;
			graphicObjectHolder.tabFocusEnabled = false;
			
			addEventListener(MouseEvent.MOUSE_OVER, onMouseOver);
			addEventListener(MouseEvent.MOUSE_OUT, onMouseOut);
			
			wbModel.addEventListener(WhiteboardUpdateReceived.NEW_ANNOTATION, onNewAnnotationEvent);
			wbModel.addEventListener(WhiteboardUpdateReceived.RECEIVED_ANNOTATION_HISTORY, onReceivedAnnotationsHistory);
			wbModel.addEventListener(WhiteboardUpdateReceived.CLEAR_ANNOTATIONS, onClearAnnotations);
			wbModel.addEventListener(WhiteboardUpdateReceived.UNDO_ANNOTATION, onUndoAnnotation);
			wbModel.addEventListener(WhiteboardAccessEvent.MODIFIED_WHITEBOARD_ACCESS, onModifiedAccess);
			
			whiteboardToolbar.addEventListener(WhiteboardButtonEvent.ENABLE_WHITEBOARD, onEnableWhiteboardEvent);
			whiteboardToolbar.addEventListener(WhiteboardButtonEvent.DISABLE_WHITEBOARD, onDisableWhiteboardEvent);
		}
		
		public function attachToReceivingObject(ro:IWhiteboardReceiver):void {
			ro.receiveCanvas(this);
			ro.receiveToolbars(whiteboardToolbar, textToolbar);
		}
		
		private function registerForMouseEvents():void {
			addEventListener(MouseEvent.MOUSE_DOWN, doMouseDown);
		}
		
		private function unregisterForMouseEvents():void {
			removeEventListener(MouseEvent.MOUSE_DOWN, doMouseDown);
		}
		
		private function doMouseUp(event:MouseEvent):void {
			canvasModel.doMouseUp(Math.min(Math.max(parent.mouseX, 0), parent.width) - this.x, Math.min(Math.max(parent.mouseY, 0), parent.height) - this.y);
			
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
			canvasModel.doMouseMove(Math.min(Math.max(parent.mouseX, 0), parent.width-1) - this.x, Math.min(Math.max(parent.mouseY, 0), parent.height-1) - this.y);
		}
		
		public function changeColor(e:Event):void {
			canvasModel.changeColor(e.target.selectedColor);
		}
		
		public function isEditingText():Boolean {
			return canvasDisplayModel.isEditingText();
		}
		
		public function sendGraphicToServer(gobj:Annotation):void {
			// LogUtil.debug("DISPATCHING SEND sendGraphicToServer [" + type + "]");
			var event:WhiteboardDrawEvent = new WhiteboardDrawEvent(WhiteboardDrawEvent.SEND_SHAPE);
			event.annotation = gobj;
			var dispatcher:Dispatcher = new Dispatcher();
			dispatcher.dispatchEvent(event);					
		}
		
		public function sendUndoToServer():void {
			var event:WhiteboardDrawEvent = new WhiteboardDrawEvent(WhiteboardDrawEvent.UNDO);
			event.wbId = currentWhiteboardId;
			var dispatcher:Dispatcher = new Dispatcher();
			dispatcher.dispatchEvent(event);
		}
		
		public function sendClearToServer():void {
			var event:WhiteboardDrawEvent = new WhiteboardDrawEvent(WhiteboardDrawEvent.CLEAR);
			event.wbId = currentWhiteboardId;
			var dispatcher:Dispatcher = new Dispatcher();
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
		
		public function changeThickness(e:Event):void {
			canvasModel.changeThickness(e.target.value);
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
				CursorManager.setCursor(ellipse_icon);
			} else if(toolType == AnnotationType.RECTANGLE) {
				CursorManager.setCursor(rectangle_icon);
			} else if(toolType == AnnotationType.TRIANGLE) {
				CursorManager.setCursor(triangle_icon);
			} else if(toolType == AnnotationType.PENCIL) {
				CursorManager.setCursor(pencil_icon, 2, -2, -22);
			} else if(toolType == AnnotationType.LINE) {
				CursorManager.setCursor(line_icon);
			} else if(toolType == AnnotationType.TEXT) {
				CursorManager.setCursor(text_icon);
			} 
		}
		
		private function removeCursor():void {
			CursorManager.removeCursor(CursorManager.currentCursorID);
		}
		
		public function doesContain(child:DisplayObject):Boolean {
			return this.graphicObjectHolder.rawChildren.contains(child);
		}
		
		public function getMouseXY():Array {
			return [Math.min(Math.max(parent.mouseX, 0), parent.width-2) - this.x, Math.min(Math.max(parent.mouseY, 0), parent.height-2) - this.y];
		}
		
		public function removeGraphic(child:DisplayObject):void {
			if (doesContain(child)) this.graphicObjectHolder.rawChildren.removeChild(child);
			else trace("Does not contain");
		}
		
		public function addGraphic(child:DisplayObject):void {
			this.graphicObjectHolder.rawChildren.addChild(child);
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
			this.width = width;
			this.height = height;	
			canvasDisplayModel.zoomCanvas(width, height);
			canvasModel.zoomCanvas(width, height);
			textToolbar.adjustForZoom(width, height);
		}
		
		public function displayWhiteboardById(wbId:String):void {
			currentWhiteboardId = wbId;
			canvasDisplayModel.changeWhiteboard(wbId);
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
			//if (e.whiteboardId == currentWhiteboardId) {
			whiteboardToolbar.whiteboardAccessModified(e.multiUser);
			//}
		}
		
		private function onEnableWhiteboardEvent(e:WhiteboardButtonEvent):void {
			e.stopPropagation();
			
			this.whiteboardEnabled = true;
			setWhiteboardInteractable();
		}
		
		private function onDisableWhiteboardEvent(e:WhiteboardButtonEvent):void {
			e.stopPropagation();
			
			this.whiteboardEnabled = false;
			setWhiteboardInteractable();
		}
	}
}
