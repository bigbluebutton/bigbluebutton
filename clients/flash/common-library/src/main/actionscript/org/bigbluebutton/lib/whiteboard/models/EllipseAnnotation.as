package org.bigbluebutton.lib.whiteboard.models {
	
	import mx.graphics.SolidColorStroke;
	
	import spark.components.Group;
	import spark.primitives.Ellipse;
	
	public class EllipseAnnotation extends Annotation {
		private var _ellipse:Ellipse;
		
		public function EllipseAnnotation(id:String, userId:String, type:String, status:String, annInfo:Object) {
			super(id, userId, type, status, annInfo);
		}
		
		override protected function makeGraphic():void {
			_ellipse.stroke = new SolidColorStroke(annInfo.color, denormalize(annInfo.thickness, _parentWidth));
			var arrayEnd:Number = annInfo.points.length;
			var startX:Number = denormalize(annInfo.points[0], _parentWidth);
			var startY:Number = denormalize(annInfo.points[1], _parentHeight);
			var width:Number = denormalize(annInfo.points[arrayEnd - 2], _parentWidth) - startX;
			var height:Number = denormalize(annInfo.points[arrayEnd - 1], _parentHeight) - startY;
			_ellipse.x = startX;
			_ellipse.y = startY;
			_ellipse.width = width;
			_ellipse.height = height;
		}
		
		override public function draw(canvas:Group):void {
			if (!_ellipse) {
				_ellipse = new Ellipse();
			}
			
			super.draw(canvas);
			
			if (!canvas.containsElement(_ellipse)) {
				canvas.addElement(_ellipse);
			}
		}
		
		override public function remove(canvas:Group):void {
			if (canvas.containsElement(_ellipse)) {
				canvas.removeElement(_ellipse);
				_ellipse = null;
				super.remove(canvas);
			}
		}
	}
}
