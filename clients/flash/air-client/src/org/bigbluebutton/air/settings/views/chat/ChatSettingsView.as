package org.bigbluebutton.air.settings.views.chat {
	import spark.layouts.VerticalLayout;
	
	import org.bigbluebutton.air.common.views.NoTabView;
	import org.bigbluebutton.air.main.views.TopToolbarAIR;
	import org.bigbluebutton.air.settings.views.TopToolbarSubSettings;
	import org.bigbluebutton.lib.settings.views.chat.ChatSettingsViewBase;
	
	public class ChatSettingsView extends NoTabView {
		
		private var _settingsView:ChatSettingsViewBase;
		
		public function ChatSettingsView() {
			super();
			
			var vLayout:VerticalLayout = new VerticalLayout();
			vLayout.gap = 0;
			layout = vLayout;
			
			_settingsView = new ChatSettingsViewBaseAIR();
			_settingsView.percentHeight = 100;
			_settingsView.percentWidth = 100;
			addElement(_settingsView);
		}
		
		override protected function createToolbar():TopToolbarAIR {
			return new TopToolbarSubSettings();
		}
	}
}
