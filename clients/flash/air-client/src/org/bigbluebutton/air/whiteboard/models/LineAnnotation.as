package org.bigbluebutton.air.whiteboard.models {
	
	import mx.graphics.SolidColorStroke;
	
	import spark.components.Group;
	import spark.primitives.Line;
	
	public class LineAnnotation extends Annotation {
		private var _line:Line;
		
		public function LineAnnotation(id:String, userId:String, type:String, status:String, annInfo:Object) {
			super(id, userId, type, status, annInfo);
		}
		
		override protected function makeGraphic():void {
			_line.stroke = new SolidColorStroke(uint(annInfo.color), denormalize(annInfo.thickness, _parentWidth));
			var arrayEnd:Number = annInfo.points.length;
			var startX:Number = denormalize(annInfo.points[0], _parentWidth);
			var startY:Number = denormalize(annInfo.points[1], _parentHeight);
			var endX:Number = denormalize(annInfo.points[arrayEnd - 2], _parentWidth);
			var endY:Number = denormalize(annInfo.points[arrayEnd - 1], _parentHeight);
			_line.xFrom = startX;
			_line.yFrom = startY;
			_line.xTo = endX;
			_line.yTo = endY;
		}
		
		override public function draw(canvas:Group):void {
			if (!_line) {
				_line = new Line();
			}
			
			super.draw(canvas);
			
			if (!canvas.containsElement(_line)) {
				canvas.addElement(_line);
			}
		}
		
		override public function remove(canvas:Group):void {
			if (canvas.containsElement(_line)) {
				canvas.removeElement(_line);
				_line = null;
				super.remove(canvas);
			}
		}
	}
}
