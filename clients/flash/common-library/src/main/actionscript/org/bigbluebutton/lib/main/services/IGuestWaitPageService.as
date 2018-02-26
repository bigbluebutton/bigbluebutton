package org.bigbluebutton.lib.main.services {
	import flash.net.URLRequest;
	
	import org.osflash.signals.ISignal;
	
	public interface IGuestWaitPageService {
		function get guestAccessAllowedSignal():ISignal;
		
		function get guestAccessDeniedSignal():ISignal;
		
		function get failureSignal():ISignal;
		
		function wait(guestWaitUrl:String, urlRequest:URLRequest, url:String, sessionToken:String):void;
	}
}
