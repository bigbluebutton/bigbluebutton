package org.bigbluebutton.web.main.commands {
	
	import flash.net.URLRequest;
	
	import org.bigbluebutton.lib.main.commands.ConnectSignal;
	import org.bigbluebutton.lib.main.commands.ConnectingFailedSignal;
	import org.bigbluebutton.lib.main.models.Config;
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.main.services.ILoginService;
	import org.bigbluebutton.lib.video.models.VideoProfileManager;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class JoinMeetingCommandWeb extends Command {
		private const LOG:String = "JoinMeetingCommandWeb::";
		
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
			var urlRequest:URLRequest = new URLRequest();
			
			loginService.loginSuccessSignal.add(loginSuccess);
			loginService.getConfigSuccessSignal.add(configSuccess);
			loginService.getProfilesSuccessSignal.add(profilesSuccess);
			loginService.loginFailureSignal.add(loginFailure);
			loginService.login(urlRequest, url, "token");
		}
		
		protected function profilesSuccess(profiles:VideoProfileManager):void {
			userSession.videoProfileManager = profiles;
		}
		
		protected function loginSuccess(userObject:Object):void {
			trace(LOG + "successJoined()");
			conferenceParameters.load(userObject);
			connectSignal.dispatch(new String(userSession.config.application.uri));
		}
		
		protected function configSuccess(config:Config):void {
			userSession.config = config;
		}
		
		protected function loginFailure(reason:String):void {
			trace(LOG + "loginFailure()");
			connectingFailedSignal.dispatch(reason);
		}
	}
}
