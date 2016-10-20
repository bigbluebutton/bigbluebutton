package org.bigbluebutton.lib.whiteboard.models {
	
	import mx.graphics.SolidColorStroke;
	
	import spark.primitives.Line;
	
	import org.bigbluebutton.lib.whiteboard.views.IWhiteboardCanvas;
	
	public class LineAnnotation extends Annotation {
		private var _thickness:int = 1;
		
		private var _transparency:Boolean = false;
		
		private var _points:Array = [];
		
		private var _line:Line;
		
		public function LineAnnotation(type:String, anID:String, whiteboardID:String, status:String, color:Number, thickness:Number, transparency:Boolean, points:Array) {
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
				_thickness = LineAnnotation(an).thickness;
				_transparency = LineAnnotation(an).transparency;
				_points = LineAnnotation(an).points;
			}
		}
		
		override public function draw(canvas:IWhiteboardCanvas, zoom:Number):void {
			if (!_line) {
				_line = new Line();
			}
			_line.stroke = new SolidColorStroke(uint(color), thickness * zoom);
			var arrayEnd:Number = points.length;
			var startX:Number = denormalize(points[0], canvas.width);
			var startY:Number = denormalize(points[1], canvas.height);
			var endX:Number = denormalize(points[arrayEnd - 2], canvas.width);
			var endY:Number = denormalize(points[arrayEnd - 1], canvas.height);
			_line.xFrom = startX;
			_line.yFrom = startY;
			_line.xTo = endX;
			_line.yTo = endY;
			if (!canvas.containsElement(_line)) {
				canvas.addElement(_line);
			}
		}
		
		override public function remove(canvas:IWhiteboardCanvas):void {
			if (canvas.containsElement(_line)) {
				canvas.removeElement(_line);
			}
		}
	}
}
