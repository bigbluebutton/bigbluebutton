package org.bigbluebutton.air.settings.views.camera {
	import spark.components.ToggleSwitch;
	
	import org.bigbluebutton.lib.settings.views.camera.CameraSettingsViewBase;
	
	public class CameraSettingsViewBaseAIR extends CameraSettingsViewBase {
		override protected function get toggleButtonClass():Class {
			return ToggleSwitch;
		}
	}
}
