package org.bigbluebutton.air.settings.views.lock {
	
	import org.bigbluebutton.air.common.views.NoTabView;
	import org.bigbluebutton.air.main.views.TopToolbarBase;
	import org.bigbluebutton.air.settings.views.TopToolbarSubSettings;
	
	import spark.components.Scroller;
	import spark.layouts.VerticalLayout;
	
	public class LockSettingsView extends NoTabView {
		private var _lockSettingsView:LockSettingsViewBase;
		
		public function LockSettingsView() {
			super();
			
			var vLayout:VerticalLayout = new VerticalLayout();
			vLayout.gap = 0;
			layout = vLayout;
			
			_lockSettingsView = new LockSettingsViewBaseAIR();
			_lockSettingsView.percentWidth = 100;
			
			var scroller:Scroller = new Scroller();
			scroller.viewport = _lockSettingsView;
			scroller.percentWidth = 100;
			scroller.percentHeight = 100;
			
			addElement(scroller);
		}
		
		override protected function createToolbar():TopToolbarBase {
			return new TopToolbarSubSettings();
		}
	}
}
