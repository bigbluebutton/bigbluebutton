package org.bigbluebutton.air.main.views {
	import flash.events.MouseEvent;
	
	import org.bigbluebutton.air.common.PageEnum;
	import org.bigbluebutton.air.main.models.IUISession;
	import org.bigbluebutton.lib.main.views.MenuButtonsMediatorBase;
	
	public class MenuButtonsMediatorAIR extends MenuButtonsMediatorBase {
		
		[Inject]
		public var uiSession:IUISession;
		
		override protected function audioOnOff(e:MouseEvent):void {
			if (!meetingData.users.me.voiceJoined) {
				uiSession.pushPage(PageEnum.ECHOTEST);
			} else {
				var audioOptions:Object = new Object();
				audioOptions.shareMic = !meetingData.users.me.voiceJoined;
				shareMicrophoneSignal.dispatch(audioOptions);
			}
		}
	}
}
