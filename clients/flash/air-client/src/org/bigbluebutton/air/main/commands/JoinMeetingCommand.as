package org.bigbluebutton.air.main.commands {
	
	import flash.net.URLRequest;
	
	import org.bigbluebutton.air.main.models.Config;
	import org.bigbluebutton.air.main.models.IConferenceParameters;
	import org.bigbluebutton.air.main.models.IUserSession;
	import org.bigbluebutton.air.main.services.IGuestWaitPageService;
	import org.bigbluebutton.air.main.services.ILoginService;
	import org.bigbluebutton.air.main.services.JoinService;
	import org.bigbluebutton.air.video.models.VideoProfileManager;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class JoinMeetingCommand extends Command {
		private const LOG:String = "JoinMeetingCommand::";
		
		[Inject]
		public var guestWaitService:IGuestWaitPageService;
		
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
			var joinSubservice:JoinService = new JoinService();
			joinSubservice.successSignal.add(joinSuccess);
			joinSubservice.failureSignal.add(joinFailure);
			joinSubservice.guestWaitSignal.add(onGuestWaitSignal);
			
			guestWaitService.guestAccessAllowedSignal.add(joinSuccess);
			
			joinSubservice.join(url);
		}
		
		protected function onGuestWaitSignal(waitUrl:String, urlRequest:URLRequest, responseUrl:String, sessionToken:String):void {
			//trace("GUEST WAIT URL = " + waitUrl);
			guestWaitService.wait(waitUrl, urlRequest, responseUrl, sessionToken);
		}
		
		protected function joinSuccess(urlRequest:URLRequest, responseUrl:String, sessionToken:String):void {
			loginService.loginSuccessSignal.add(loginSuccess);
			loginService.getConfigSuccessSignal.add(configSuccess);
			loginService.getProfilesSuccessSignal.add(profilesSuccess);
			loginService.loginFailureSignal.add(joinFailure);
			loginService.login(urlRequest, responseUrl, sessionToken);
		}
		
		protected function loginSuccess(userObject:Object):void {
			trace(LOG + "successJoined()");
			conferenceParameters.load(userObject);
			connectSignal.dispatch(new String(userSession.config.application.uri));
		}
		
		protected function configSuccess(config:Config):void {
			userSession.config = config;
		}
		
		protected function profilesSuccess(profiles:VideoProfileManager):void {
			userSession.videoProfileManager = profiles;
		}
		
		protected function joinFailure(reason:String):void {
			trace(LOG + "joinFailure()");
			connectingFailedSignal.dispatch(reason);
		}
	}
}
