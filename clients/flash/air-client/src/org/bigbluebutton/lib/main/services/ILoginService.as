package org.bigbluebutton.lib.main.services {
	
	import flash.net.URLRequest;
	
	import org.osflash.signals.ISignal;
	
	public interface ILoginService {
		function get loginSuccessSignal():ISignal;
		function get getConfigSuccessSignal():ISignal;
		function get getProfilesSuccessSignal():ISignal;
		function get loginFailureSignal():ISignal;
		function login(urlRequest:URLRequest, url:String, sessionToken:String):void;
	}
}
