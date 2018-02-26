package org.bigbluebutton.air.main.commands {
	import org.bigbluebutton.air.common.PageEnum;
	import org.bigbluebutton.air.main.models.IUISession;
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.main.models.IUserSession;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class ConnectingFinishedCommandAIR extends Command {
		
		[Inject]
		public var uiSession:IUISession
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var conferenceParameters:IConferenceParameters;
		
		override public function execute():void {
			uiSession.popPage();
			
			uiSession.setLoading(false, "Loading Finished");
			// fixme: this view is already loaded in onLoadingChange of LoadScreenMadiator class
			uiSession.pushPage(PageEnum.MAIN);
	//		displayAudioSettings();
	//		if (userSession.videoAutoStart && !userSession.skipCamSettingsCheck) {
	//			uiSession.pushPage(PageEnum.CAMERASETTINGS);
	//		}
		}
		
		private function displayAudioSettings(micLocked:Boolean = false):void {
			userSession.lockSettings.disableMicSignal.remove(displayAudioSettings);
			if (userSession.phoneOptions.autoJoin && !userSession.phoneOptions.skipCheck && (userSession.userList.me.isModerator() || !userSession.lockSettings.disableMic)) {
				uiSession.pushPage(PageEnum.AUDIOSETTINGS);
			} else {
				userSession.phoneOptions.autoJoin = false;
			}
		}
	
	}
}
