package org.bigbluebutton.lib.whiteboard.models {
	
	import mx.graphics.SolidColorStroke;
	
	import spark.primitives.Rect;
	
	import org.bigbluebutton.lib.whiteboard.views.IWhiteboardCanvas;
	
	public class RectangleAnnotation extends Annotation {
		private var _thickness:Number = 1;
		
		private var _transparency:Boolean = false;
		
		private var _points:Array = [];
		
		private var _square:Boolean = false;
		
		private var _rectangle:Rect;
		
		public function RectangleAnnotation(type:String, anID:String, whiteboardID:String, status:String, color:Number, thickness:Number, transparency:Boolean, points:Array, square:Boolean) {
			super(type, anID, whiteboardID, status, color);
			_thickness = thickness;
			_transparency = transparency;
			_points = points;
			_square = square;
		}
		
		public function get thickness():int {
			return _thickness;
		}
		
		public function get transparency():Boolean {
			return _transparency;
		}
		
		public function get points():Array {
			return _points;
		}
		
		public function get square():Boolean {
			return _square;
		}
		
		override public function update(an:IAnnotation):void {
			if (an.anID == anID) {
				super.update(an);
				_thickness = RectangleAnnotation(an).thickness;
				_transparency = RectangleAnnotation(an).transparency;
				_points = RectangleAnnotation(an).points;
				_square = RectangleAnnotation(an).square;
			}
		}
		
		override public function draw(canvas:IWhiteboardCanvas, zoom:Number):void {
			if (!_rectangle) {
				_rectangle = new Rect();
			}
			_rectangle.stroke = new SolidColorStroke(uint(color), thickness * zoom);
			var arrayEnd:Number = points.length;
			var startX:Number = denormalize(points[0], canvas.width);
			var startY:Number = denormalize(points[1], canvas.height);
			var width:Number = denormalize(points[arrayEnd - 2], canvas.width) - startX;
			var height:Number = denormalize(points[arrayEnd - 1], canvas.height) - startY;
			_rectangle.x = startX;
			_rectangle.y = startY;
			_rectangle.width = width;
			_rectangle.height = (square ? width : height);
			if (!canvas.containsElement(_rectangle)) {
				canvas.addElement(_rectangle);
			}
		}
		
		override public function remove(canvas:IWhiteboardCanvas):void {
			if (canvas.containsElement(_rectangle)) {
				canvas.removeElement(_rectangle);
			}
		}
	}
}
