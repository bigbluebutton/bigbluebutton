package org.bigbluebutton.lib.common.utils
{
	import flash.events.Event;
	import flash.events.HTTPStatusEvent;
	import flash.events.IOErrorEvent;
	import flash.net.URLLoader;
	import flash.net.URLLoaderDataFormat;
	import flash.net.URLRequest;
	import flash.net.URLRequestMethod;
	import flash.net.URLVariables;
	
	import mx.utils.ObjectUtil;
	
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;

	public class GuestWaitURLFetcher
	{
		protected var _successSignal:Signal = new Signal();
		
		protected var _failureSignal:Signal = new Signal();
		
		protected var _urlRequest:URLRequest = null;
		
		protected var _responseURL:String = null;
		
		public function GuestWaitURLFetcher()
		{
		}
		
		public function get successSignal():ISignal {
			return _successSignal;
		}
		
		public function get failureSignal():ISignal {
			return _failureSignal;
		}
		
		public function fetch(url:String, urlRequest:URLRequest, reqVars: URLVariables,
							  dataFormat:String = URLLoaderDataFormat.TEXT):void {
			trace("Fetching " + url);
			_urlRequest = urlRequest;
			if (_urlRequest == null) {
				_urlRequest = new URLRequest();
				//if (_userAgent) {
				//	_urlRequest["userAgent"] = _userAgent;
				//}
				//_urlRequest.manageCookies = true; // only available in AIR, defaults to "true"
				//_urlRequest.followRedirects = true; // only available in AIR, defaults to "true"
				_urlRequest.method = URLRequestMethod.GET;
			}
			_urlRequest.url = _responseURL = url;
			
			if (reqVars != null) {
				trace("reqVars " + reqVars.toString());
				_urlRequest.data = reqVars;
			}
			
			var urlLoader:URLLoader = new URLLoader();
			urlLoader.addEventListener(Event.COMPLETE, handleComplete);
			urlLoader.addEventListener(HTTPStatusEvent.HTTP_STATUS, httpStatusHandler);
			urlLoader.addEventListener(IOErrorEvent.IO_ERROR, ioErrorHandler);
			if (HTTPStatusEvent.HTTP_RESPONSE_STATUS) { // only available in AIR, see http://stackoverflow.com/questions/2277650/unable-to-get-http-response-code-headers-in-actionscript-3
				urlLoader.addEventListener(HTTPStatusEvent.HTTP_RESPONSE_STATUS, httpResponseStatusHandler);
			}
			//urlLoader.dataFormat = dataFormat;
			urlLoader.load(_urlRequest);
		}
		
		private function httpResponseStatusHandler(e:HTTPStatusEvent):void {
			_responseURL = e.responseURL;
			trace("httpResponseStatusHandler Redirected to " + _responseURL);
		}
		
		private function httpStatusHandler(e:HTTPStatusEvent):void {
			// do nothing here
		}
		
		private function handleComplete(e:Event):void {
			trace("httpResponseStatusHandler Redirected to " + _responseURL);
			successSignal.dispatch(e.target.data, _responseURL, _urlRequest);
		}
		
		private function ioErrorHandler(e:IOErrorEvent):void {
			trace(ObjectUtil.toString(e));
			failureSignal.dispatch(e.text);
		}
	}
}