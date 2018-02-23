package org.bigbluebutton.air.voice.views {
	import spark.layouts.VerticalLayout;
	
	import org.bigbluebutton.air.common.views.NoTabView;
	import org.bigbluebutton.air.main.views.TopToolbarAIR;
	import org.bigbluebutton.lib.voice.views.EchoTestViewBase;
	import org.osmf.layout.HorizontalAlign;
	
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
		
		override protected function createToolbar():TopToolbarAIR {
			return new TopToolbarEchoTest();
		}
	}
}
