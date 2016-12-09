package org.bigbluebutton.air.main.views {
	import flash.events.MouseEvent;
	
	import org.bigbluebutton.air.common.PageEnum;
	import org.bigbluebutton.air.main.models.IUISession;
	import org.bigbluebutton.lib.main.views.TopToolbarMediatorBase;
	
	public class TopToolbarMediatorAIR extends TopToolbarMediatorBase {
		
		[Inject]
		public var uiSession:IUISession;
		
		override protected function leftButtonClickHandler(e:MouseEvent):void {
			uiSession.pushPage(PageEnum.PARTICIPANTS);
		}
		
		override protected function rightButtonClickHandler(e:MouseEvent):void {
			
		}
	}
}
