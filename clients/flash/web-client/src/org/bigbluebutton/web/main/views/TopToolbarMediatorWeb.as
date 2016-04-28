package org.bigbluebutton.web.main.views {
	import flash.events.MouseEvent;
	
	import org.bigbluebutton.lib.main.views.TopToolbarMediatorBase;
	import org.bigbluebutton.web.main.models.IUISession;
	
	public class TopToolbarMediatorWeb extends TopToolbarMediatorBase {
		
		[Inject]
		public var uiSession:IUISession;
		
		override protected function leftButtonClickHandler(e:MouseEvent):void {
			uiSession.participantsOpen = !uiSession.participantsOpen;
		}
		
		override protected function rightButtonClickHandler(e:MouseEvent):void {
		
		}
	}
}
