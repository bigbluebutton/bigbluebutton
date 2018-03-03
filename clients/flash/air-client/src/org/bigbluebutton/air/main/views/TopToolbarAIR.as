package org.bigbluebutton.air.main.views {
	import mx.graphics.SolidColor;
	
	import spark.primitives.Rect;
	
	public class TopToolbarAIR extends TopToolbarBase {
		
		private var _background:Rect;
		
		public function TopToolbarAIR() {
			super();
			
			_background = new Rect();
			_background.percentHeight = 100;
			_background.percentWidth = 100;
			_background.fill = new SolidColor();
			addElementAt(_background, 0);
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			
			SolidColor(_background.fill).color = getStyle("backgroundColor");
		}
	}
}
