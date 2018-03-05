package org.bigbluebutton.air.whiteboard.models {
	
	import mx.graphics.SolidColorStroke;
	
	import org.bigbluebutton.air.whiteboard.util.Triangle;
	
	import spark.components.Group;
	
	public class TriangleAnnotation extends Annotation {
		private var _triangle:Triangle;
		
		public function TriangleAnnotation(id:String, userId:String, type:String, status:String, annInfo:Object) {
			super(id, userId, type, status, annInfo);
		}
		
		override protected function makeGraphic():void {
			_triangle.stroke = new SolidColorStroke(uint(annInfo.color), denormalize(annInfo.thickness, _parentWidth));
			var arrayEnd:Number = annInfo.points.length;
			var startX:Number = denormalize(annInfo.points[0], _parentWidth);
			var startY:Number = denormalize(annInfo.points[1], _parentHeight);
			var triangleWidth:Number = denormalize(annInfo.points[arrayEnd - 2], _parentWidth) - startX;
			var triangleHeight:Number = denormalize(annInfo.points[arrayEnd - 1], _parentHeight) - startY;
			_triangle.x = startX;
			_triangle.y = startY;
			_triangle.width = triangleWidth;
			_triangle.height = triangleHeight;
		}
		
		override public function draw(canvas:Group):void {
			if (!_triangle) {
				_triangle = new Triangle();
			}
			
			super.draw(canvas);
			
			if (!canvas.containsElement(_triangle)) {
				canvas.addElement(_triangle);
			}
		}
		
		override public function remove(canvas:Group):void {
			if (canvas.containsElement(_triangle)) {
				canvas.removeElement(_triangle);
				_triangle = null;
				super.remove(canvas);
			}
		}
	}
}
