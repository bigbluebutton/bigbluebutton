package org.bigbluebutton.lib.whiteboard.models {
	
	import mx.graphics.SolidColorStroke;
	
	import spark.primitives.Path;
	
	import org.bigbluebutton.lib.whiteboard.views.IWhiteboardCanvas;
	
	public class PencilAnnotation extends Annotation {
		private var _thickness:int = 1;
		
		private var _transparency:Boolean = false;
		
		private var _points:Array = [];
		
		private var _path:Path;
		
		public function PencilAnnotation(type:String, anID:String, whiteboardID:String, status:String, color:Number, thickness:Number, transparency:Boolean, points:Array) {
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
				_thickness = PencilAnnotation(an).thickness;
				_transparency = PencilAnnotation(an).transparency;
				_points = PencilAnnotation(an).points;
			}
		}
		
		override public function draw(canvas:IWhiteboardCanvas, zoom:Number):void {
			if (!_path) {
				_path = new Path();
			}
			_path.stroke = new SolidColorStroke(uint(color), thickness * zoom);
			var graphicsCommands:String = "";
			graphicsCommands += "M ";
			graphicsCommands += denormalize(points[0], canvas.width) + " " + denormalize(points[1], canvas.height) + "\n";
			for (var i:int = 2; i < points.length; i += 2) {
				graphicsCommands += "L ";
				graphicsCommands += denormalize(points[i], canvas.width) + " " + denormalize(points[i + 1], canvas.height) + "\n";
			}
			_path.data = graphicsCommands;
			if (!canvas.containsElement(_path)) {
				canvas.addElement(_path);
			}
		}
		
		override public function remove(canvas:IWhiteboardCanvas):void {
			if (canvas.containsElement(_path)) {
				canvas.removeElement(_path);
			}
		}
	}
}
