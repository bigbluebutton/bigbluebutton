package org.bigbluebutton.air.settings.views.lock {
	import spark.components.ToggleSwitch;
	
	import org.bigbluebutton.lib.settings.views.lock.LockSettingsViewBase;
	
	public class LockSettingsViewBaseAIR extends LockSettingsViewBase {
		
		override protected function get toggleButtonClass():Class {
			return ToggleSwitch;
		}
	}
}
