package org.bigbluebutton.air.video.views.swapcamera {
	
	import spark.components.Button;
	
	public class SwapCameraButton extends Button implements ISwapCameraButton {
		public function SwapCameraButton() {
			super();
		}
		
		public function setVisibility(val:Boolean):void {
			super.visible = val;
		}
		
		public function dispose():void {
			this.dispose();
		}
	}
}
