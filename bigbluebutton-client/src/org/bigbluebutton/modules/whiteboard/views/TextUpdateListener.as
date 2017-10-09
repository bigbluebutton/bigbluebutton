package org.bigbluebutton.modules.whiteboard.views {
	import flash.events.Event;
	import flash.events.FocusEvent;
	import flash.events.KeyboardEvent;
	import flash.ui.Keyboard;
	import org.bigbluebutton.modules.whiteboard.business.shapes.ShapeFactory;
	import org.bigbluebutton.modules.whiteboard.business.shapes.TextDrawAnnotation;
	import org.bigbluebutton.modules.whiteboard.business.shapes.TextObject;
	import org.bigbluebutton.modules.whiteboard.models.Annotation;
	import org.bigbluebutton.modules.whiteboard.models.AnnotationStatus;

	public class TextUpdateListener {
		private var _whiteboardCanvas:WhiteboardCanvas;
		private var _shapeFactory:ShapeFactory;
		
		private var _currentTextObject:TextObject;
		
		public function TextUpdateListener() {
		}
		
		public function setDependencies(whiteboardCanvas:WhiteboardCanvas, shapeFactory:ShapeFactory):void {
			_whiteboardCanvas = whiteboardCanvas;
			_shapeFactory = shapeFactory;
		}
		
		public function canvasMouseDown():void {
			/**
			 * Check if the presenter is starting a new text annotation without committing the last one.
			 * If so, publish the last text annotation. 
			 */
			if (needToPublish()) {
				sendTextToServer(AnnotationStatus.DRAW_END, _currentTextObject);
			}
		}
		
		private function needToPublish():Boolean {
			return _currentTextObject != null && _currentTextObject.status != AnnotationStatus.DRAW_END;
		}
		
		public function isEditingText():Boolean {
			return needToPublish();
		}
		
		public function newTextObject(tobj:TextObject):void {
			if (_currentTextObject != null) {
				canvasMouseDown();
			}
			_currentTextObject = tobj;
			_whiteboardCanvas.textToolbarSyncProxy(_currentTextObject);
			_whiteboardCanvas.stage.focus = tobj;
			tobj.registerListeners(textObjLostFocusListener, textObjTextChangeListener, textObjKeyDownListener);
		}
		
		public function removedTextObject(tobj:TextObject):void {
			if (tobj == _currentTextObject) {
				_currentTextObject = null;
				_whiteboardCanvas.textToolbarSyncProxy(null);
				tobj.deregisterListeners(textObjLostFocusListener, textObjTextChangeListener, textObjKeyDownListener);
			}
		}
		
		private function textObjLostFocusListener(event:FocusEvent):void {
			//      LogUtil.debug("### LOST FOCUS ");
			// The presenter is moving the mouse away from the textbox. Perhaps to change the size and color of the text.
			// Maintain focus to this textbox until the presenter does mouse down on the whiteboard canvas.
			maintainFocusToTextBox(event);
		}
		
		private function textObjTextChangeListener(event:Event):void {
			// The text is being edited. Notify others to update the text.
			var sendStatus:String = AnnotationStatus.DRAW_UPDATE;
			var tf:TextObject = event.target as TextObject;  
			sendTextToServer(sendStatus, tf);  
		}
		
		private function textObjKeyDownListener(event:KeyboardEvent):void {
			// check for special conditions
			if (event.keyCode  == Keyboard.DELETE || event.keyCode  == Keyboard.BACKSPACE || event.keyCode  == Keyboard.ENTER) {
				var sendStatus:String = AnnotationStatus.DRAW_UPDATE;
				var tobj:TextObject = event.target as TextObject;
				sendTextToServer(sendStatus, tobj);
			}
			// stops stops page changing when trying to navigate the text box
			if (event.keyCode == Keyboard.LEFT || event.keyCode == Keyboard.RIGHT) {
				event.stopPropagation();
			}
		}
		
		private function maintainFocusToTextBox(event:FocusEvent):void {
			if (event.currentTarget == _currentTextObject) {
				var tf:TextObject = event.currentTarget as TextObject;
				if (_whiteboardCanvas.stage.focus != tf) _whiteboardCanvas.stage.focus = tf;
			}
		}
		
		private function sendTextToServer(status:String, tobj:TextObject):void {
			if (status == AnnotationStatus.DRAW_END) {
				tobj.deregisterListeners(textObjLostFocusListener, textObjTextChangeListener, textObjKeyDownListener);
				_currentTextObject = null;
				_whiteboardCanvas.textToolbarSyncProxy(null);
			}
			
			//      LogUtil.debug("SENDING TEXT: [" + tobj.textSize + "]");
			var tda:TextDrawAnnotation = _shapeFactory.createTextAnnotation(tobj.text, tobj.textColor, tobj.x, tobj.y, tobj.width, tobj.height, tobj.fontSize);
			
			tda.status = status;
			tda.id = tobj.id;
			
			var an:Annotation = tda.createAnnotation(tobj.whiteboardId);
			
			_whiteboardCanvas.sendGraphicToServer(an);
		}
	}
}