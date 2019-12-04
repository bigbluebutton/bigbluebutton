package org.bigbluebutton.air.settings.views.lock {
	import spark.components.ToggleSwitch;
	
	public class LockSettingsViewBaseAIR extends LockSettingsViewBase {
		
		override protected function get toggleButtonClass():Class {
			return ToggleSwitch;
		}
	}
}
