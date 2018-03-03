package org.bigbluebutton.air.settings.views.camera {
	import spark.components.ToggleSwitch;
	
	public class CameraSettingsViewBaseAIR extends CameraSettingsViewBase {
		override protected function get toggleButtonClass():Class {
			return ToggleSwitch;
		}
	}
}
