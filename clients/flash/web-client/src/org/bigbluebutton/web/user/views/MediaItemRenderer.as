package org.bigbluebutton.web.user.views {
	import spark.components.Button;
	import spark.components.HGroup;
	import spark.components.Label;
	import spark.components.gridClasses.GridItemRenderer;
	
	public class MediaItemRenderer extends GridItemRenderer {
		private var webcamButton:Button;
		private var microphoneButton:Button;
		
		public function MediaItemRenderer() {
			super();
			
			clipAndEnableScrolling = true;
			
			var g1:HGroup = new HGroup();
			g1.gap = 0;
			
			webcamButton = new Button();
			webcamButton.width = 21;
			webcamButton.height = 21;
			g1.addElement(webcamButton);
			microphoneButton = new Button();
			microphoneButton.width = 21;
			microphoneButton.height = 21;
			g1.addElement(microphoneButton);
			
			addElement(g1);
		}
		
		override public function prepare(hasBeenRecycled:Boolean):void {
			if (data != null) {
				if (data.hasStream) {
					webcamButton.styleName = "userButtonStyle mediaWebcamStyle";
				} else {
					webcamButton.styleName = "userButtonStyle";
				}
				
				if (data.voiceJoined) {
					if (data.muted) {
						microphoneButton.styleName = "userButtonStyle mediaMutedStyle";
					} else {
						microphoneButton.styleName = "userButtonStyle mediaMicrophoneStyle";
					}
				} else if (data.listenOnly) {
					microphoneButton.styleName = "userButtonStyle mediaListenStyle";
				} else {
					microphoneButton.styleName = "userButtonStyle";
				}
			}
		}
	}
}
