package org.bigbluebutton.air.participants.views {
	import flash.events.MouseEvent;
	
	import org.bigbluebutton.air.common.PageEnum;
	import org.bigbluebutton.air.main.views.TopToolbarMediatorAIR;
	
	public class TopToolbarMediatorParticipants extends TopToolbarMediatorAIR {
		
		override protected function setTitle():void {
			view.titleLabel.text = "Participants";
		}
		
		override protected function rightButtonClickHandler(e:MouseEvent):void {
			uiSession.pushPage(PageEnum.MAIN);
		}
	}
}
