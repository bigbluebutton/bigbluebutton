package org.bigbluebutton.air.settings.views {
	
	import spark.components.Button;
	import spark.components.RadioButtonGroup;
	
	public class CameraSettingsView extends CameraSettingsViewBase implements ICameraSettingsView {
		override protected function childrenCreated():void {
			super.childrenCreated();
		}
		
		public function dispose():void {
		}
		
		public function get startCameraButton():Button {
			return startCameraButton0;
		}
		
		public function get swapCameraButton():Button {
			return swapCameraBtn0;
		}
		
		public function get cameraQualityRadioGroup():RadioButtonGroup {
			return cameraQualityTypeRadioButtonGroup;
		}
		
		public function setCameraQuality(value:int):void {
			switch (value) {
				case 0:
					cameraQualityTypeRadioButtonGroup.selectedValue = "low";
					break;
				case 1:
					cameraQualityTypeRadioButtonGroup.selectedValue = "medium";
					break;
				case 2:
					cameraQualityTypeRadioButtonGroup.selectedValue = "high";
					break;
			}
		}
	}
}
