package org.bigbluebutton.air.settings.views.camera {
	
	import org.bigbluebutton.air.common.views.NoTabView;
	import org.bigbluebutton.air.main.views.TopToolbarBase;
	import org.bigbluebutton.air.settings.views.TopToolbarSubSettings;
	
	import spark.layouts.VerticalLayout;
	
	public class CameraSettingsView extends NoTabView {
		
		private var _settingsView:CameraSettingsViewBase;
		
		public function CameraSettingsView() {
			super();
			
			var vLayout:VerticalLayout = new VerticalLayout();
			vLayout.gap = 0;
			layout = vLayout;
			
			_settingsView = new CameraSettingsViewBaseAIR();
			_settingsView.percentHeight = 100;
			_settingsView.percentWidth = 100;
			addElement(_settingsView);
		}
		
		override protected function createToolbar():TopToolbarBase {
			return new TopToolbarSubSettings();
		}
	}
}
