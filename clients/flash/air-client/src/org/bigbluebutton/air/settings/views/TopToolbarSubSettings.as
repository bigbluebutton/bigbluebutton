package org.bigbluebutton.air.settings.views {
	import org.bigbluebutton.air.main.views.TopToolbarAIR;
	
	public class TopToolbarSubSettings extends TopToolbarAIR {
		public function TopToolbarSubSettings() {
			super();
			
			leftButton.styleName = "icon-left-arrow topButton topLeftButton";
			rightButton.styleName = "saveButton topRightButton";
			rightButton.label = "SAVE";
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
		}
	
	}
}
