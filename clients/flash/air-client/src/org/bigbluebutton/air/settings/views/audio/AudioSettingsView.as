package org.bigbluebutton.air.settings.views.audio {
	
	import spark.layouts.HorizontalAlign;
	import spark.layouts.VerticalLayout;
	
	import org.bigbluebutton.air.common.views.NoTabView;
	import org.bigbluebutton.air.main.views.TopToolbarAIR;
	import org.bigbluebutton.air.settings.views.TopToolbarSubSettings;
	import org.bigbluebutton.lib.settings.views.audio.AudioSettingsViewBase;
	
	public class AudioSettingsView extends NoTabView {
		private var _settingsView:AudioSettingsViewBase;
		
		public function AudioSettingsView() {
			super();
			
			var vLayout:VerticalLayout = new VerticalLayout();
			vLayout.gap = 0;
			vLayout.horizontalAlign = HorizontalAlign.CENTER;
			layout = vLayout;
			
			_settingsView = new AudioSettingsViewBase();
			_settingsView.percentHeight = 100;
			_settingsView.percentWidth = 100;
			addElement(_settingsView);
		}
		
		override protected function createToolbar():TopToolbarAIR {
			return new TopToolbarSubSettings();
		}
	}
}
