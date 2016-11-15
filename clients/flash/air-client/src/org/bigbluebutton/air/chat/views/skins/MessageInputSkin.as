package org.bigbluebutton.air.chat.views.skins {
	import spark.skins.mobile.ScrollingStageTextInputSkin;
	
	public class MessageInputSkin extends ScrollingStageTextInputSkin {
		public function MessageInputSkin() {
			super();
			
			borderClass = MessageInputBorder320;
		}
		
		
		override protected function drawBackground(unscaledWidth:Number, unscaledHeight:Number):void {
			// need to redo background draw so that it follows the new border shape.
			super.drawBackground(unscaledWidth, unscaledHeight);
		}
	}
}
