package org.bigbluebutton.web.main.views {
	import mx.graphics.SolidColor;
	
	import spark.components.Group;
	import spark.primitives.Rect;
	
	public class MainPanel extends Group {
		public function MainPanel() {
			super();
			
			var fillerRect:Rect = new Rect();
			fillerRect.percentWidth = 100;
			fillerRect.percentHeight = 100;
			var fill:SolidColor = new SolidColor();
			fill.color = 0x0000FF;
			fillerRect.fill = fill;
			addElement(fillerRect);
		}
	}
}