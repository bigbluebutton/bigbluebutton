package org.bigbluebutton.air.settings.views.chat {
	import spark.components.ToggleSwitch;
	
	import org.bigbluebutton.lib.settings.views.chat.ChatSettingsViewBase;
	
	public class ChatSettingsViewBaseAIR extends ChatSettingsViewBase {
		override protected function get toggleButtonClass():Class {
			return ToggleSwitch;
		}
	}
}
