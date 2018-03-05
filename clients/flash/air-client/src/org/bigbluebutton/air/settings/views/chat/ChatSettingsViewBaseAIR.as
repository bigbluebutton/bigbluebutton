package org.bigbluebutton.air.settings.views.chat {
	import spark.components.ToggleSwitch;
	
	public class ChatSettingsViewBaseAIR extends ChatSettingsViewBase {
		override protected function get toggleButtonClass():Class {
			return ToggleSwitch;
		}
	}
}
