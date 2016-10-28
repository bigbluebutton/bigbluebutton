package org.bigbluebutton.air.participants.views {
	import flash.events.MouseEvent;
	
	import org.bigbluebutton.air.common.PageEnum;
	import org.bigbluebutton.air.main.models.IUISession;
	import org.bigbluebutton.lib.main.views.TopToolbarMediatorBase;
	
	public class TopToolbarMediatorParticipants extends TopToolbarMediatorBase {
		[Inject]
		public var uiSession:IUISession;
		
		override protected function setTitle():void {
			view.titleLabel.text = "Participants";
		}
		
		override protected function leftButtonClickHandler(e:MouseEvent):void {
			// do nothing
		}
		
		override protected function rightButtonClickHandler(e:MouseEvent):void {
			uiSession.pushPage(PageEnum.MAIN);
		}
	}
}
