package org.bigbluebutton.lib.common.utils {
	
	import flash.desktop.NativeApplication;
	import flash.events.Event;
	import flash.events.HTTPStatusEvent;
	import flash.events.IOErrorEvent;
	import flash.net.URLLoader;
	import flash.net.URLLoaderDataFormat;
	import flash.net.URLRequest;
	import flash.net.URLRequestMethod;
	
	import mx.utils.ObjectUtil;
	
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public class URLFetcher {
		protected var _successSignal:Signal = new Signal();
		
		protected var _unsuccessSignal:Signal = new Signal();
		
		protected var _urlRequest:URLRequest = null;
		
		protected var _responseUrl:String = null;
		
		protected var _httpStatusCode:Number = 0;
		
		public function get successSignal():ISignal {
			return _successSignal;
		}
		
		public function get unsuccessSignal():ISignal {
			return _unsuccessSignal;
		}
		
		public function fetch(url:String, urlRequest:URLRequest = null, dataFormat:String = URLLoaderDataFormat.TEXT, followRedirect:Boolean = true):void {
			trace("Fetching " + url);
			_urlRequest = urlRequest;
			if (_urlRequest == null) {
				_urlRequest = new URLRequest();
				//setUserAgent();
				_urlRequest.manageCookies = true;
				_urlRequest.method = URLRequestMethod.GET;
			}
			_urlRequest.followRedirects = followRedirect;
			_urlRequest.url = url;
			var urlLoader:URLLoader = new URLLoader();
			urlLoader.addEventListener(Event.COMPLETE, handleComplete);
			urlLoader.addEventListener(HTTPStatusEvent.HTTP_STATUS, httpStatusHandler);
			urlLoader.addEventListener(IOErrorEvent.IO_ERROR, ioErrorHandler);
			urlLoader.addEventListener(HTTPStatusEvent.HTTP_RESPONSE_STATUS, httpResponseStatusHandler);
			urlLoader.dataFormat = dataFormat;
			urlLoader.load(_urlRequest);
		}
		
	/*	private function setUserAgent():void {
			// AirCapabilities ANE to get the device information
			var airCap:AirCapabilities = new AirCapabilities();
			var deviceName:String = airCap.getMachineName();
			if (deviceName != "") {
				// include device name in the user agent looking for the first ")" character as follows:
				// Mozilla/5.0 (Android; U; pt-BR<; DEVICE NAME>) AppleWebKit/533.19.4 (KHTML, like Gecko) AdobeAIR/16.0
				var userAgent:Array = _urlRequest.userAgent.split(")");
				userAgent[0] += "; " + deviceName;
				_urlRequest.userAgent = userAgent.join(")");
			}
			var OSVersion:String = airCap.getOSVersion();
			if (OSVersion != "") {
				// include os version in the user agent looking for the first ";" character as follows:
				// Mozilla/5.0 (Android< OSVERSION>; U; pt-BR) AppleWebKit/533.19.4 (KHTML, like Gecko) AdobeAIR/16.0
				var userAgent:Array = _urlRequest.userAgent.split(";");
				userAgent[0] += " " + OSVersion;
				_urlRequest.userAgent = userAgent.join(";");
			}
			var appXML:XML = NativeApplication.nativeApplication.applicationDescriptor;
			var ns:Namespace = appXML.namespace();
			// append client name and version to the end of the user agent
			_urlRequest.userAgent += " " + appXML.ns::name + "/" + appXML.ns::versionNumber;
			trace(_urlRequest.userAgent);
		} */
		
		private function httpResponseStatusHandler(e:HTTPStatusEvent):void {
			_responseUrl = e.responseURL;
			_httpStatusCode = e.status;
			trace("Redirected to " + _responseUrl);
		}
		
		private function httpStatusHandler(e:HTTPStatusEvent):void {
			// do nothing here
		}
		
		private function handleComplete(e:Event):void {
			successSignal.dispatch(e.target.data, _responseUrl, _urlRequest, _httpStatusCode);
		}
		
		private function ioErrorHandler(e:IOErrorEvent):void {
			trace(ObjectUtil.toString(e));
			unsuccessSignal.dispatch(e.text);
		}
	}
}

