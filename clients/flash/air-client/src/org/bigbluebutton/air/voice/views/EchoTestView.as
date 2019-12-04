package org.bigbluebutton.air.voice.views {
	import org.bigbluebutton.air.common.views.NoTabView;
	import org.bigbluebutton.air.main.views.TopToolbarBase;
	import org.osmf.layout.HorizontalAlign;
	
	import spark.layouts.VerticalLayout;
	
	public class EchoTestView extends NoTabView {
		
		private var _echoTestView:EchoTestViewBase;
		
		public function EchoTestView() {
			super();
			
			var vLayout:VerticalLayout = new VerticalLayout();
			vLayout.gap = 0;
			vLayout.horizontalAlign = HorizontalAlign.CENTER;
			layout = vLayout;
			
			_echoTestView = new EchoTestViewBase();
			
			addElement(_echoTestView);
		}
		
		override protected function createToolbar():TopToolbarBase {
			return new TopToolbarEchoTest();
		}
	}
}
