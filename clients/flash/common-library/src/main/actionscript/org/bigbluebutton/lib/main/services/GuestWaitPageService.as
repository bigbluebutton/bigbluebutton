package org.bigbluebutton.lib.main.services
{
	import flash.net.URLRequest;
	
	import org.bigbluebutton.lib.common.utils.GuestWaitURLFetcher;
	import org.bigbluebutton.lib.common.utils.URLFetcher;
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;

	public class GuestWaitPageService implements IGuestWaitPageService
	{
		protected var _urlRequest:URLRequest = null;
		
		protected var _guestAccessAllowedSignal:Signal = new Signal();
		protected var _guestAccessDeniedSignal:Signal = new Signal();
		
		protected var _loginFailureSignal:Signal = new Signal();
		
		private var sessionToken:String;
		
		public function get guestAccessAllowedSignal():ISignal {
			return _guestAccessAllowedSignal;
		}
		
		public function get guestAccessDeniedSignal():ISignal {
			return _guestAccessDeniedSignal;
		}
		
		public function get loginFailureSignal():ISignal {
			return _loginFailureSignal;
		}
				
		protected function fail(reason:String):void {
			trace("Login failed. " + reason);
			loginFailureSignal.dispatch(reason);
			//TODO: show message to user saying that the meeting identifier is invalid 
		}
		
		public function wait(urlRequest:URLRequest, url:String, sessionToken:String):void {
			_urlRequest = urlRequest;
			this.sessionToken = sessionToken;
			var fetcher:GuestWaitURLFetcher = new GuestWaitURLFetcher();
			fetcher.successSignal.add(onSuccess);
			fetcher.failureSignal.add(onFailure);
			fetcher.fetch(joinUrl, null, null);
		}
		
	}
}