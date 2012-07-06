package com.senocular.display {
	
	import flash.display.InteractiveObject;
	import flash.display.MovieClip;
	import flash.geom.Matrix;
	import flash.geom.Point;
	
	public class TransformToolControl extends MovieClip {
		
		// Variables
		protected var _transformTool:TransformTool;
		protected var _referencePoint:Point;
		protected var _relatedObject:InteractiveObject;
			
		// Properties
		
		/**
		 * Reference to TransformTool instance using the control
		 * This property is defined after using TransformTool.addControl
		 * prior to being added to the TransformTool display list
		 * (it can be accessed after the TransformTool.CONTROL_INIT event)
		 */
		public function get transformTool():TransformTool {
			return _transformTool;
		}
		public function set transformTool(t:TransformTool):void {
			_transformTool = t;
		}
		
		/**
		 * The object "related" to this control and can be referenced
		 * if the control needs association with another object.  This is
		 * used with the default move control to relate itself with the
		 * tool target (cursors also check for this)
		 */
		public function get relatedObject():InteractiveObject {
			return _relatedObject;
		}
		public function set relatedObject(i:InteractiveObject):void {
			_relatedObject = i ? i : this;
		}
		
		/**
		 * A point of reference that can be used to handle transformations
		 * A TransformTool instance will use this property for offsetting the
		 * location of the mouse to match the desired start location of the transform
		 */
		public function get referencePoint():Point {
			return _referencePoint;
		}
		public function set referencePoint(p:Point):void {
			_referencePoint = p;
		}
		
		/**
		 * Constructor
		 */
		public function TransformToolControl() {
			_relatedObject = this;
		}
		
		/**
		 * Optionally used with transformTool.maintainHandleForm to 
		 * counter transformations applied to a control by its parents
		 */
		public function counterTransform():void {
			transform.matrix = new Matrix();
			var concatMatrix:Matrix = transform.concatenatedMatrix;
			concatMatrix.invert();
			transform.matrix = concatMatrix;
		}
	}
}