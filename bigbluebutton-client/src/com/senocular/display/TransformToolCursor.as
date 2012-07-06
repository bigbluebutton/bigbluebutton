package com.senocular.display {
	
	import flash.display.DisplayObject;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.geom.Matrix;
	import flash.geom.Point;
	import flash.utils.Dictionary;
	
	import com.senocular.display.TransformTool;
	import com.senocular.display.TransformToolControl;
	
	public class TransformToolCursor extends TransformToolControl {
		
		protected var _mouseOffset:Point = new Point(20, 20);
		protected var contact:Boolean = false;
		protected var active:Boolean = false;
		protected var references:Dictionary = new Dictionary(true);
			
		public function get mouseOffset():Point {
			return _mouseOffset.clone();
		}
		public function set mouseOffset(p:Point):void {
			_mouseOffset = p;
		}
		
		public function TransformToolCursor() {
			addEventListener(TransformTool.CONTROL_INIT, init);
		}
			
		/**
		 * Adds a reference to the list of references that the cursor
		 * uses to determine when to be displayed.  Typically this would
		 * be a TransformToolControl instance used in the transform tool
		 * @see removeReference
		 */
		public function addReference(reference:DisplayObject):void {
			if (reference && !references[reference]) {
				references[reference] = true;
				addReferenceListeners(reference);
			}
		}
		
		/**
		 * Removes a reference to the list of references that the cursor
		 * uses to determine when to be displayed.
		 * @see addReference
		 */
		public function removeReference(reference:DisplayObject):DisplayObject {
			if (reference && references[reference]) {
				removeReferenceListeners(reference);
				delete references[reference];
				return reference;
			}
			return null;
		}
		
		/**
		 * Called when the cursor should determine 
		 * whether it should be visible or not
		 */
		public function updateVisible(event:Event = null):void {
			if (active) {
				if (!visible) {
					visible = true;
				}
			}else if (visible != contact) {
				visible = contact;
			}
			position(event);
		}
		
		/**
		 * Called when the cursor should position itself
		 */
		public function position(event:Event = null):void {
			if (parent) {
				x = parent.mouseX + mouseOffset.x;
				y = parent.mouseY + mouseOffset.y;
			}
		}
		
		private function init(event:Event):void {
			_transformTool.addEventListener(TransformTool.TRANSFORM_TOOL, position, false, 0, true);
			_transformTool.addEventListener(TransformTool.NEW_TARGET, referenceUnset, false, 0, true);
			_transformTool.addEventListener(TransformTool.CONTROL_TRANSFORM_TOOL, position, false, 0, true);
			_transformTool.addEventListener(TransformTool.CONTROL_DOWN, controlMouseDown, false, 0, true);
			_transformTool.addEventListener(TransformTool.CONTROL_MOVE, controlMove, false, 0, true);
			_transformTool.addEventListener(TransformTool.CONTROL_UP, controlMouseUp, false, 0, true);
			updateVisible(event);
			position(event);
		}
		
		private function addReferenceListeners(reference:DisplayObject):void {
			reference.addEventListener(MouseEvent.MOUSE_MOVE, referenceMove, false, 0, true);
			reference.addEventListener(MouseEvent.MOUSE_DOWN, referenceSet, false, 0, true);
			reference.addEventListener(MouseEvent.ROLL_OVER, referenceSet, false, 0, true);
			reference.addEventListener(MouseEvent.ROLL_OUT, referenceUnset, false, 0, true);
		}
		
		private function removeReferenceListeners(reference:DisplayObject):void {
			reference.removeEventListener(MouseEvent.MOUSE_MOVE, referenceMove, false);
			reference.removeEventListener(MouseEvent.MOUSE_DOWN, referenceSet, false);
			reference.removeEventListener(MouseEvent.ROLL_OVER, referenceSet, false);
			reference.removeEventListener(MouseEvent.ROLL_OUT, referenceUnset, false);
		}
		
		protected function referenceMove(event:MouseEvent):void {
			position(event);
			event.updateAfterEvent();
		}
		
		protected function referenceSet(event:Event):void {
			contact = true;
			if (!_transformTool.currentControl) {
				updateVisible(event);
			}
		}
		
		protected function referenceUnset(event:Event):void {
			contact = false;
			if (!_transformTool.currentControl) {
				updateVisible(event);
			}
		}
	
		// the following control methods rely on TransformToolControl.relatedObject
		// to tell if a reference is being interacted with and therefore active
		
		protected function controlMouseDown(event:Event):void {
			if (references[_transformTool.currentControl.relatedObject]) {
				active = true;
				//~ contact = true;
			}
			updateVisible(event);
		}
		
		protected function controlMove(event:Event):void {
			if (references[_transformTool.currentControl.relatedObject]) {
				position(event);
			}
		}
		
		protected function controlMouseUp(event:Event):void {
			if (references[_transformTool.currentControl.relatedObject]) {
				active = false;
			}
			updateVisible(event);
		}
	}
}