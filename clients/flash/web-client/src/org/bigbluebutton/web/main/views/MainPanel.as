package org.bigbluebutton.web.main.views {
	import mx.graphics.SolidColor;
	
	import org.bigbluebutton.lib.presentation.models.Presentation;
	import org.bigbluebutton.lib.presentation.views.PresentationViewBase;
	
	import spark.components.Group;
	import spark.layouts.VerticalLayout;
	import spark.primitives.Rect;
	
	public class MainPanel extends Group {
		private var _presentationView:PresentationViewBase;
		
		public function MainPanel() {
			super();
			
			var l:VerticalLayout = new VerticalLayout();
			layout = l;
			
			var fillerRect:Rect = new Rect();
			fillerRect.percentWidth = 100;
			fillerRect.percentHeight = 100;
			var fill:SolidColor = new SolidColor();
			fill.color = 0x0000FF;
			fillerRect.fill = fill;
			addElement(fillerRect);
			
			_presentationView = new PresentationViewBase();
			_presentationView.percentWidth = 100;
			_presentationView.percentHeight = 100;
			addElement(_presentationView);
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			//leave a couple of pixels to separate the slides from the border
			_presentationView.width = w;
			_presentationView.height = h;
		}
	}
}