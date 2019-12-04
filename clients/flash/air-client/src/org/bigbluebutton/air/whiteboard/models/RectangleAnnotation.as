package org.bigbluebutton.air.whiteboard.models {
	
	import mx.graphics.SolidColorStroke;
	
	import spark.components.Group;
	import spark.primitives.Rect;
	
	public class RectangleAnnotation extends Annotation {
		
		private var _rectangle:Rect;
		
		public function RectangleAnnotation(id:String, userId:String, type:String, status:String, annInfo:Object) {
			super(id, userId, type, status, annInfo);
		}
		
		override protected function makeGraphic():void {
			_rectangle.stroke = new SolidColorStroke(uint(annInfo.color), denormalize(annInfo.thickness, _parentWidth));
			var arrayEnd:Number = annInfo.points.length;
			var startX:Number = denormalize(annInfo.points[0], _parentWidth);
			var startY:Number = denormalize(annInfo.points[1], _parentHeight);
			var width:Number = denormalize(annInfo.points[arrayEnd - 2], _parentWidth) - startX;
			var height:Number = denormalize(annInfo.points[arrayEnd - 1], _parentHeight) - startY;
			_rectangle.x = startX;
			_rectangle.y = startY;
			_rectangle.width = width;
			_rectangle.height = height;
		}
		
		override public function draw(canvas:Group):void {
			if (!_rectangle) {
				_rectangle = new Rect();
			}
			
			super.draw(canvas);
			
			if (!canvas.containsElement(_rectangle)) {
				canvas.addElement(_rectangle);
			}
		}
		
		override public function remove(canvas:Group):void {
			if (canvas.containsElement(_rectangle)) {
				canvas.removeElement(_rectangle);
				_rectangle = null;
				super.remove(canvas);
			}
		}
	}
}
