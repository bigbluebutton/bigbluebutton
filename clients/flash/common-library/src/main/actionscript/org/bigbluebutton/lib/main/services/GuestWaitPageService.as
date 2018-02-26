package org.bigbluebutton.lib.main.services
{
	import flash.events.TimerEvent;
	import flash.net.URLRequest;
	import flash.utils.Timer;
	
	import org.bigbluebutton.lib.common.utils.GuestWaitURLFetcher;
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;

	public class GuestWaitPageService implements IGuestWaitPageService
	{
		
		private static const URL_REQUEST_ERROR_TYPE:String = "TypeError";
		
		private static const URL_REQUEST_INVALID_URL_ERROR:String = "invalidURL";
		
		private static const XML_RETURN_CODE_SUCCESS:String = "SUCCESS";
		
		private static const URL_REQUEST_GENERIC_ERROR:String = "genericError";
		
		private static const XML_RETURN_CODE_FAILED:String = "FAILED";
		
		private static const JOIN_URL_EMPTY:String = "emptyJoinUrl";
		
		private static const ERROR_QUERY_PARAM:String = "errors=";
		
		private static const TOKEN_QUERY_PARAM:String = "sessionToken=";
		
		protected var _urlRequest:URLRequest = null;
		
		protected var _guestAccessAllowedSignal:Signal = new Signal();
		protected var _guestAccessDeniedSignal:Signal = new Signal();
		
		protected var _failureSignal:Signal = new Signal();
		
		private var sessionToken:String;
		
		private var connectAttemptTimeout:Number = 5000;
		private var connectionTimer:Timer;
		
		public function get guestAccessAllowedSignal():ISignal {
			return _guestAccessAllowedSignal;
		}
		
		public function get guestAccessDeniedSignal():ISignal {
			return _guestAccessDeniedSignal;
		}
		
		public function get failureSignal():ISignal {
			return _failureSignal;
		}
				
		protected function fail(reason:String):void {
			trace("Login failed. " + reason);
			_failureSignal.dispatch(reason);
			//TODO: show message to user saying that the meeting identifier is invalid 
		}
		
		public function wait(urlRequest:URLRequest, url:String, sessionToken:String):void {
			_urlRequest = urlRequest;
			this.sessionToken = sessionToken;

		}
		
		private function fetch():void {
			var fetcher:GuestWaitURLFetcher = new GuestWaitURLFetcher();
			fetcher.successSignal.add(onSuccess);
			fetcher.failureSignal.add(onFailure);
			
			fetcher.fetch(guestWaitUrl, null, null);
		}
		
		private function queueFetch():void {
			connectionTimer = new Timer(connectAttemptTimeout, 1);
			connectionTimer.addEventListener(TimerEvent.TIMER, connectionTimeout);
			connectionTimer.start();
		}
		
		public function connectionTimeout (e:TimerEvent) : void {
			trace("Timedout connecting to " + guestWaitUrl);
			fetch();
		}
		
		protected function onSuccess(data:Object, responseUrl:String, urlRequest:URLRequest, httpStatusCode:Number = 200):void {
			if (httpStatusCode == 200) {
				var result:Object = JSON.parse(data as String);
				if (result.guestStatus == "WAIT") {
					queueFetch();
				} else if(result.guestStatus == "ALLOW") {
					// signal allowed
				} else if (result.guestStatus == "DENIED") {
					// signal denied
				}
			} else {
				onFailure(URL_REQUEST_GENERIC_ERROR);
			}
		}
		
		protected function onFailure(reason:String):void {
			failureSignal.dispatch(reason);
		}
		
	}
}