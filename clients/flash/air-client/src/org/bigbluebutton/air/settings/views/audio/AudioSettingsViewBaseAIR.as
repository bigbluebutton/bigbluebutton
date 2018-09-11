package org.bigbluebutton.air.settings.views.audio {
	import spark.components.ToggleSwitch;
	
	public class AudioSettingsViewBaseAIR extends AudioSettingsViewBase {
		override protected function get toggleButtonClass():Class {
			return ToggleSwitch;
		}
	}
}
