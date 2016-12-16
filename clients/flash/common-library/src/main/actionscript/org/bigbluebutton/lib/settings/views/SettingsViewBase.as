package org.bigbluebutton.lib.settings.views {
	import mx.core.ClassFactory;
	
	import spark.components.List;
	import spark.components.VGroup;
	import spark.layouts.VerticalLayout;
	
	import org.bigbluebutton.lib.chat.views.ChatRoomsItemRenderer;
	
	public class SettingsViewBase extends VGroup {
		private var _settingsList:List;
		
		public function get settingsList():List {
			return _settingsList;
		}
		
		public function SettingsViewBase() {
			_settingsList = new List();
			_settingsList.percentWidth = 100;
			_settingsList.percentHeight = 100;
			_settingsList.itemRenderer = new ClassFactory(getItemRendererClass());
			
			var listLayout:VerticalLayout = new VerticalLayout();
			listLayout.requestedRowCount = -1;
			listLayout.gap = 1;
			_settingsList.layout = listLayout;
			
			addElement(_settingsList);
		}
		
		protected function getItemRendererClass():Class {
			return ChatRoomsItemRenderer;
		}
	}
}
