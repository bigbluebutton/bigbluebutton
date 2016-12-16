package org.bigbluebutton.air.settings.views {
	import spark.layouts.HorizontalAlign;
	import spark.layouts.VerticalLayout;
	
	import org.bigbluebutton.air.common.views.NoTabView;
	import org.bigbluebutton.air.main.views.TopToolbarAIR;
	import org.bigbluebutton.lib.settings.views.SettingsViewBase;
	
	public class SettingsView extends NoTabView {
		private var _settingsView:SettingsViewBase;
		
		private var _topToolbar:TopToolbarAIR;
		
		public function SettingsView() {
			super();
			
			var vLayout:VerticalLayout = new VerticalLayout();
			vLayout.gap = 0;
			vLayout.horizontalAlign = HorizontalAlign.CENTER;
			layout = vLayout;
			
			_topToolbar = new TopToolbarSettings();
			_topToolbar.percentWidth = 100;
			addElement(_topToolbar);
			
			_settingsView = new SettingsViewBase();
			_settingsView.percentHeight = 100;
			_settingsView.percentWidth = 100;
			addElement(_settingsView);
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			
			_topToolbar.height = getStyle("toolbarHeight");
		}
	}
}
