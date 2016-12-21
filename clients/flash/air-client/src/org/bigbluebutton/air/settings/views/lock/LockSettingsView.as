package org.bigbluebutton.air.settings.views.lock {
	
	import spark.layouts.VerticalLayout;
	
	import org.bigbluebutton.air.common.views.NoTabView;
	import org.bigbluebutton.air.main.views.TopToolbarAIR;
	import org.bigbluebutton.air.settings.views.TopToolbarSettings;
	import org.bigbluebutton.lib.settings.views.lock.LockSettingsViewBase;
	
	public class LockSettingsView extends NoTabView {
		private var _lockSettingsView:LockSettingsViewBase;
		
		public function LockSettingsView() {
			super();
			
			var vLayout:VerticalLayout = new VerticalLayout();
			vLayout.gap = 0;
			layout = vLayout;
			
			_lockSettingsView = new LockSettingsViewBaseAIR();
			_lockSettingsView.percentHeight = 100;
			_lockSettingsView.percentWidth = 100;
			addElement(_lockSettingsView);
		}
		
		override protected function createToolbar():TopToolbarAIR {
			return new TopToolbarSettings();
		}
	}
}
