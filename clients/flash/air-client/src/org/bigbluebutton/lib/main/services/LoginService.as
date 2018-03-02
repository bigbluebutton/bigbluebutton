package org.bigbluebutton.lib.main.services {
	
	import flash.net.URLRequest;
	
	import org.bigbluebutton.lib.common.utils.URLParser;
	import org.bigbluebutton.lib.main.models.Config;
	import org.bigbluebutton.lib.video.models.VideoProfileManager;
	import org.bigbluebutton.lib.video.services.ProfilesService;
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public class LoginService implements ILoginService {
		protected var _urlRequest:URLRequest = null;
		
		protected var _loginSuccessSignal:Signal = new Signal();
		
		protected var _getConfigSuccessSignal:Signal = new Signal();
		
		protected var _getProfilesSuccessSignal:Signal = new Signal();
		
		protected var _successGetProfilesSignal:Signal = new Signal();
		
		protected var _loginFailureSignal:Signal = new Signal();
		
		protected var _config:Config;
		
		private var sessionToken:String;
		
		public function get loginSuccessSignal():ISignal {
			return _loginSuccessSignal;
		}
		
		public function get loginFailureSignal():ISignal {
			return _loginFailureSignal;
		}
		
		public function get getConfigSuccessSignal():ISignal {
			return _getConfigSuccessSignal;
		}
		
		public function get getProfilesSuccessSignal():ISignal {
			return _getProfilesSuccessSignal;
		}
		
		protected function fail(reason:String):void {
			trace("Login failed. " + reason);
			loginFailureSignal.dispatch(reason);
			//TODO: show message to user saying that the meeting identifier is invalid 
		}
		
		public function login(urlRequest:URLRequest, url:String, sessionToken:String):void {
			_urlRequest = urlRequest;
			this.sessionToken = sessionToken;
			var configSubservice:ConfigService = new ConfigService();
			configSubservice.successSignal.add(afterConfig);
			configSubservice.failureSignal.add(fail);
			configSubservice.getConfig(getServerUrl(url), _urlRequest, sessionToken);
		}
		
		protected function dispatchVideoProfileManager(manager:VideoProfileManager):void {
			getProfilesSuccessSignal.dispatch(manager);
			var enterSubservice:EnterService = new EnterService();
			enterSubservice.successSignal.add(afterEnter);
			enterSubservice.failureSignal.add(fail);
			enterSubservice.enter(_config.application.host, _urlRequest, sessionToken);
		}
		
		
		protected function onProfilesResponse(xml:XML):void {
			trace("success video profile");
			var prof:VideoProfileManager = new VideoProfileManager();
			prof.parseProfilesXml(xml);
			dispatchVideoProfileManager(prof);
		}
		
		protected function failedLoadingProfiles(reason:String):void {
			trace("failed video profile: " + reason);
			var prof:VideoProfileManager = new VideoProfileManager();
			prof.parseConfigXml(_config.getConfigFor("VideoconfModule"));
			dispatchVideoProfileManager(prof);
		}
		
		protected function getServerUrl(url:String):String {
			var parser:URLParser = new URLParser(url);
			return parser.protocol + "://" + parser.host + ":" + parser.port;
		}
		
		protected function afterConfig(xml:XML):void {
			_config = new Config(xml);
			getConfigSuccessSignal.dispatch(_config);
			var profilesService:ProfilesService = new ProfilesService();
			profilesService.successSignal.add(onProfilesResponse);
			profilesService.failureSignal.add(failedLoadingProfiles);
			profilesService.getProfiles(getServerUrl(_config.application.host), _urlRequest);
		}
		
		protected function afterEnter(result:Object):void {
			if (result.returncode == 'SUCCESS') {
				trace("Join SUCCESS");
				var user:Object = {username: result.fullname, conference: result.conference, 
					conferenceName: result.confname, externMeetingID: result.externMeetingID, 
					meetingID: result.meetingID, externUserID: result.externUserID, 
					internalUserId: result.internalUserID, role: result.role, room: result.room, 
					authToken: result.authToken, record: result.record, webvoiceconf: result.webvoiceconf, 
					dialnumber: result.dialnumber, voicebridge: result.voicebridge, 
					mode: result.mode, welcome: result.welcome, logoutUrl: result.logoutUrl, 
					defaultLayout: result.defaultLayout, avatarURL: result.avatarURL,
					bannerColor: result.bannerColor,
					bannerText: result.bannerText};
				
				user.customdata = new Object();
				if (result.customdata) {
					for (var key:String in result.customdata) {
						trace("checking user customdata: " + key + " = " + result.customdata[key]);
						user.customdata[key] = result.customdata[key].toString();
					}
				}
				loginSuccessSignal.dispatch(user);
			} else {
				trace("Join FAILED");
				loginFailureSignal.dispatch("Add some reason here!");
			}
		}
	}
}
