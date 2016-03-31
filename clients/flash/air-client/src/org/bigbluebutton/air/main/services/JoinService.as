package org.bigbluebutton.air.main.services {
	
	import flash.net.URLRequest;
	
	import org.bigbluebutton.lib.common.utils.URLFetcher;
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public class JoinService {
		protected var _successSignal:Signal = new Signal();
		
		protected var _failureSignal:Signal = new Signal();
		
		private static const URL_REQUEST_ERROR_TYPE:String = "TypeError";
		
		private static const URL_REQUEST_INVALID_URL_ERROR:String = "invalidURL";
		
		private static const XML_RETURN_CODE_SUCCESS:String = "SUCCESS";
		
		private static const URL_REQUEST_GENERIC_ERROR:String = "genericError";
		
		private static const XML_RETURN_CODE_FAILED:String = "FAILED";
		
		private static const JOIN_URL_EMPTY:String = "emptyJoinUrl";
		
		public function get successSignal():ISignal {
			return _successSignal;
		}
		
		public function get failureSignal():ISignal {
			return _failureSignal;
		}
		
		public function join(joinUrl:String):void {
			if (joinUrl.length == 0) {
				onFailure(JOIN_URL_EMPTY);
				return;
			}
			var fetcher:URLFetcher = new URLFetcher();
			fetcher.successSignal.add(onSuccess);
			fetcher.failureSignal.add(onFailure);
			fetcher.fetch(joinUrl);
		}
		
		protected function onSuccess(data:Object, responseUrl:String, urlRequest:URLRequest, httpStatusCode:Number = 200):void {
			if (httpStatusCode == 200) {
				try {
					var xml:XML = new XML(data);
					switch (xml.returncode.toString()) {
						case XML_RETURN_CODE_FAILED:
							onFailure(xml.messageKey);
							break;
						case XML_RETURN_CODE_SUCCESS:
							successSignal.dispatch(urlRequest, responseUrl);
							break;
						default:
							onFailure(URL_REQUEST_GENERIC_ERROR);
							break;
					}
				} catch (e:Error) {
					trace("The response is probably not a XML. " + e.message);
					successSignal.dispatch(urlRequest, responseUrl);
					return;
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
