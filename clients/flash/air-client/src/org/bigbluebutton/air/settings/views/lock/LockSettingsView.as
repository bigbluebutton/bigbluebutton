package org.bigbluebutton.air.settings.views.lock {
	
	import spark.components.Button;
	import spark.components.Label;
	import spark.components.ToggleSwitch;
	
	public class LockSettingsView extends LockSettingsViewBase implements ILockSettingsView {
		override protected function childrenCreated():void {
			super.childrenCreated();
		}
		
		public function get cameraSwitch():ToggleSwitch {
			return cam;
		}
		
		public function get micSwitch():ToggleSwitch {
			return mic;
		}
		
		public function get publicChatSwitch():ToggleSwitch {
			return publicChat;
		}
		
		public function get privateChatSwitch():ToggleSwitch {
			return privateChat;
		}
		
		public function get layoutSwitch():ToggleSwitch {
			return layout0;
		}
		
		public function get applyButton():Button {
			return apply;
		}
		
		public function dispose():void {
		}
	}
}
