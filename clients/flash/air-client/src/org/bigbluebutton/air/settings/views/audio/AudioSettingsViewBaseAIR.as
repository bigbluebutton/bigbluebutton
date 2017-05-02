package org.bigbluebutton.air.settings.views.audio {
	import spark.components.ToggleSwitch;
	
	import org.bigbluebutton.lib.settings.views.audio.AudioSettingsViewBase;
	
	public class AudioSettingsViewBaseAIR extends AudioSettingsViewBase {
		override protected function get toggleButtonClass():Class {
			return ToggleSwitch;
		}
	}
}
