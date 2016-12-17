package org.bigbluebutton.air.settings.views {
	import mx.core.FlexGlobals;
	
	import org.bigbluebutton.air.main.views.TopToolbarAIR;
	
	public class TopToolbarSubSettings extends TopToolbarAIR {
		public function TopToolbarSubSettings() {
			super();
			
			leftButton.styleName = "icon-left-arrow topButton topLeftButton";
			rightButton.styleName = "topButton topRightButton";
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			rightButton.setStyle("iconFont", FlexGlobals.topLevelApplication["getStyle"]("fontFamily"));
			rightButton.setStyle("fontFamily", FlexGlobals.topLevelApplication["getStyle"]("fontFamily"));
			rightButton.label = "SAVE";
		}
	
	}
}
