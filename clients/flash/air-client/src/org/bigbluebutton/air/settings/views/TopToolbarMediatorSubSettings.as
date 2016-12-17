package org.bigbluebutton.air.settings.views {
	import flash.events.MouseEvent;
	
	import org.bigbluebutton.air.common.PageEnum;
	import org.bigbluebutton.air.main.views.TopToolbarMediatorAIR;
	
	public class TopToolbarMediatorSubSettings extends TopToolbarMediatorAIR {
		
		override protected function leftButtonClickHandler(e:MouseEvent):void {
			uiSession.pushPage(PageEnum.SETTINGS);
		}
		
		override protected function rightButtonClickHandler(e:MouseEvent):void {
			// @todo: add save logic
			uiSession.pushPage(PageEnum.SETTINGS);
		}
	}
}
