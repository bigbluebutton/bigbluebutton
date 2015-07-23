package org.bigbluebutton.air.settings.views {
	
	import org.bigbluebutton.air.common.views.IView;
	
	import spark.components.Button;
	import spark.components.RadioButtonGroup;
	
	public interface ICameraSettingsView extends IView {
		function get startCameraButton():Button;
		function get swapCameraButton():Button;
		function get cameraQualityRadioGroup():RadioButtonGroup;
		function setCameraQuality(value:int):void;
	}
}
