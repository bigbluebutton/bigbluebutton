package org.bigbluebutton.air.settings.views.lock {
	
	import org.bigbluebutton.air.common.views.IView;
	
	import spark.components.Button;
	import spark.components.Label;
	import spark.components.ToggleSwitch;
	
	public interface ILockSettingsView extends IView {
		function get cameraSwitch():ToggleSwitch;
		function get micSwitch():ToggleSwitch;
		function get publicChatSwitch():ToggleSwitch;
		function get privateChatSwitch():ToggleSwitch;
		function get applyButton():Button;
		function get layoutSwitch():ToggleSwitch;
	}
}
