package org.bigbluebutton.air.main.views.ui.videobutton {
	
	import spark.components.Button;
	
	public class VideoButton extends Button implements IVideoButton {
		public function VideoButton() {
			super();
		}
		
		public function dispose():void {
		}
		
		public function setVisibility(val:Boolean):void {
			this.visible = val;
			this.includeInLayout = val;
		}
	}
}
