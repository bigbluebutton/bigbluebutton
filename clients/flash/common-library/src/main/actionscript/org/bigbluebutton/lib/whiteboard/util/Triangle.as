package org.bigbluebutton.lib.whiteboard.util {
	import flash.display.Graphics;
	
	import spark.primitives.supportClasses.StrokedElement;
	
	public class Triangle extends StrokedElement {
		public function Triangle() {
			super();
		}
		
		override public function get measuredWidth():Number {
			return width;
		}
		
		override public function get measuredHeight():Number {
			return height;
		}
		
		override protected function draw(g:Graphics):void {
			g.moveTo(x + width / 2, y);
			g.lineTo(x + width, y + height);
			g.lineTo(x, height + y);
			g.lineTo(x + width / 2, y);
		}
	}
}
