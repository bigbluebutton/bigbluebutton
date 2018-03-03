package org.bigbluebutton.air.voice.views {
	import flash.events.MouseEvent;
	
	import org.bigbluebutton.air.main.models.IUISession;
	
	public class EchoTestViewMediatorAIR extends EchoTestViewMediator {
		
		[Inject]
		public var uiSession:IUISession;
		
		public function EchoTestViewMediatorAIR() {
			super();
		}
		
		override protected function yesButtonHandler(e:MouseEvent):void {
			super.yesButtonHandler(e);
			uiSession.popPage();
		}
	}
}
