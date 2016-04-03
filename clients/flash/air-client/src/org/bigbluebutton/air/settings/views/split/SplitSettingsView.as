package org.bigbluebutton.air.settings.views.split {
	
	import flash.events.MouseEvent;
	import spark.components.Button;
	import spark.components.Group;
	import spark.components.Label;
	import spark.components.List;
	import spark.components.RadioButtonGroup;
	import spark.components.ViewNavigator;
	
	public class SplitSettingsView extends SplitSettingsViewBase implements ISplitSettingsView {
		override protected function childrenCreated():void {
			super.childrenCreated();
		}
		
		public function dispose():void {
		}
		
		public function get settingsNavigator():ViewNavigator {
			return settingsnavigator0;
		}
		
		public function get leftMenu():ViewNavigator {
			return leftmenu0;
		}
	}
}
