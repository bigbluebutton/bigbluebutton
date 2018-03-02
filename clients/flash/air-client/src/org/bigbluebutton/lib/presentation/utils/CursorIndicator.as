package org.bigbluebutton.lib.presentation.utils {
	import mx.graphics.SolidColor;
	import mx.graphics.SolidColorStroke;
	
	import spark.components.Group;
	import spark.primitives.Ellipse;
	
	public class CursorIndicator {
		private static var SIZE:Number = 10;
		
		private static var COLOR:uint = 0xFF0000;
		
		private static var ALPHA:Number = 0.6;
		
		private var _x:Number = -1;
		
		private var _y:Number = -1;
		
		private var _indicator:Ellipse;
		
		public function CursorIndicator() {
			super();
		}
		
		public function draw(canvas:Group, newX:Number, newY:Number):void {
			if (!_indicator) {
				_indicator = new Ellipse();
			}
			
			_x = newX;
			_y = newY;
			
			_indicator.stroke = new SolidColorStroke(COLOR, 1, ALPHA);
			_indicator.fill = new SolidColor(COLOR, ALPHA);
			_indicator.x = newX * canvas.width - (SIZE / 2);
			_indicator.y = newY * canvas.height - (SIZE / 2);
			_indicator.width = SIZE;
			_indicator.height = SIZE;
			
			if (newX < 0 || newY < 0 || newX > 1 || newY > 1) {
				remove(canvas);
			} else if (!canvas.containsElement(_indicator)) {
				canvas.addElement(_indicator);
			}
		}
		
		public function redraw(canvas:Group):void {
			draw(canvas, _x, _y);
		}
		
		public function remove(canvas:Group):void {
			if (canvas.containsElement(_indicator)) {
				canvas.removeElement(_indicator);
			}
		}
	}
}
