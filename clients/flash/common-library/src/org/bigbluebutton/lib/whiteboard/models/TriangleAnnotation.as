package org.bigbluebutton.lib.whiteboard.models {
	
	import mx.graphics.SolidColorStroke;
	
	import org.bigbluebutton.lib.whiteboard.util.Triangle;
	import org.bigbluebutton.lib.whiteboard.views.IWhiteboardCanvas;
	
	public class TriangleAnnotation extends Annotation {
		private var _thickness:Number = 1;
		
		private var _transparency:Boolean = false;
		
		private var _points:Array = [];
		
		private var _triangle:Triangle;
		
		public function TriangleAnnotation(type:String, anID:String, whiteboardID:String, status:String, color:Number, thickness:Number, transparency:Boolean, points:Array) {
			super(type, anID, whiteboardID, status, color);
			_thickness = thickness;
			_transparency = transparency;
			_points = points;
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
		
		override public function update(an:IAnnotation):void {
			if (an.anID == anID) {
				super.update(an);
				_thickness = TriangleAnnotation(an).thickness;
				_transparency = TriangleAnnotation(an).transparency;
				_points = TriangleAnnotation(an).points;
			}
		}
		
		override public function draw(canvas:IWhiteboardCanvas, zoom:Number):void {
			if (!_triangle) {
				_triangle = new Triangle();
			}
			_triangle.stroke = new SolidColorStroke(uint(color), thickness * zoom);
			var arrayEnd:Number = points.length;
			var startX:Number = denormalize(points[0], canvas.width);
			var startY:Number = denormalize(points[1], canvas.height);
			var triangleWidth:Number = denormalize(points[arrayEnd - 2], canvas.width) - startX;
			var triangleHeight:Number = denormalize(points[arrayEnd - 1], canvas.height) - startY;
			_triangle.x = startX;
			_triangle.y = startY;
			_triangle.width = triangleWidth;
			_triangle.height = triangleHeight;
			if (!canvas.containsElement(_triangle)) {
				canvas.addElement(_triangle);
			}
		}
		
		override public function remove(canvas:IWhiteboardCanvas):void {
			if (canvas.containsElement(_triangle)) {
				canvas.removeElement(_triangle);
			}
		}
	}
}
