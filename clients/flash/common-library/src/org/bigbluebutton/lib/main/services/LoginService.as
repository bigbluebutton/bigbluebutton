package org.bigbluebutton.lib.main.services {
	
	import flash.net.URLRequest;
	
	import org.bigbluebutton.lib.common.utils.URLParser;
	import org.bigbluebutton.lib.main.models.Config;
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public class LoginService implements ILoginService {
		protected var _urlRequest:URLRequest = null;
		
		protected var _loginSuccessSignal:Signal = new Signal();
		
		protected var _getConfigSuccessSignal:Signal = new Signal();
		
		protected var _loginFailureSignal:Signal = new Signal();
		
		public function get loginSuccessSignal():ISignal {
			return _loginSuccessSignal;
		}
		
		public function get loginFailureSignal():ISignal {
			return _loginFailureSignal;
		}
		
		public function get getConfigSuccessSignal():ISignal {
			return _getConfigSuccessSignal;
		}
		
		protected function fail(reason:String):void {
			trace("Login failed. " + reason);
			loginFailureSignal.dispatch(reason);
			//TODO: show message to user saying that the meeting identifier is invalid 
		}
		
		public function login(urlRequest:URLRequest, url:String):void {
			_urlRequest = urlRequest;
			var configSubservice:ConfigService = new ConfigService();
			configSubservice.successSignal.add(afterConfig);
			configSubservice.failureSignal.add(fail);
			configSubservice.getConfig(getServerUrl(url), _urlRequest);
		}
		
		protected function getServerUrl(url:String):String {
			var parser:URLParser = new URLParser(url);
			return parser.protocol + "://" + parser.host + ":" + parser.port;
		}
		
		protected function afterConfig(xml:XML):void {
			var config:Config = new Config(xml);
			getConfigSuccessSignal.dispatch(config);
			var enterSubservice:EnterService = new EnterService();
			enterSubservice.successSignal.add(afterEnter);
			enterSubservice.failureSignal.add(fail);
			enterSubservice.enter(config.application.host, _urlRequest);
		}
		
		protected function afterEnter(result:Object):void {
			if (result.returncode == 'SUCCESS') {
				trace("Join SUCCESS");
				var user:Object = {
						username: result.fullname,
						conference: result.conference,
						conferenceName: result.confname,
						externMeetingID: result.externMeetingID,
						meetingID: result.meetingID,
						externUserID: result.externUserID,
						internalUserId: result.internalUserID,
						role: result.role,
						room: result.room,
						authToken: result.authToken,
						record: result.record,
						webvoiceconf: result.webvoiceconf,
						dialnumber: result.dialnumber,
						voicebridge: result.voicebridge,
						mode: result.mode,
						welcome: result.welcome,
						logoutUrl: result.logoutUrl,
						defaultLayout: result.defaultLayout,
						avatarURL: result.avatarURL,
						guest: result.guest};
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
