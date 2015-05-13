package org.bigbluebutton.lib.main.commands {
	
	import org.bigbluebutton.lib.main.models.Config;
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.main.services.ILoginService;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class JoinMeetingCommand extends Command {
		private const LOG:String = "JoinMeetingCommand::";
		
		[Inject]
		public var loginService:ILoginService;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var url:String;
		
		[Inject]
		public var conferenceParameters:IConferenceParameters;
		
		[Inject]
		public var connectSignal:ConnectSignal;
		
		[Inject]
		public var connectingFailedSignal:ConnectingFailedSignal;
		
		override public function execute():void {
			loginService.joinSuccessSignal.add(successJoined);
			loginService.getConfigSuccessSignal.add(successConfig);
			loginService.joinFailureSignal.add(unsuccessJoined);
			loginService.load(url);
		}
		
		protected function successJoined(userObject:Object):void {
			trace(LOG + "successJoined()");
			conferenceParameters.load(userObject);
			connectSignal.dispatch(new String(userSession.config.application.uri));
		}
		
		protected function successConfig(config:Config):void {
			userSession.config = config;
		}
		
		protected function unsuccessJoined(reason:String):void {
			trace(LOG + "unsuccessJoined()");
			connectingFailedSignal.dispatch(reason);
		}
	}
}
