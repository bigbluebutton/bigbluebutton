package org.bigbluebutton.air.main.services {
	
	import com.freshplanet.nativeExtensions.AirCapabilities;
	
	import flash.desktop.NativeApplication;
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
			var fetcher:URLFetcher = new URLFetcher(getUserAgent());
			fetcher.successSignal.add(onSuccess);
			fetcher.failureSignal.add(onFailure);
			fetcher.fetch(joinUrl);
		}
		
		private function getUserAgent():String {
			
			var urlRequest:URLRequest = new URLRequest();
			
			// AirCapabilities ANE to get the device information
			var airCap:AirCapabilities = new AirCapabilities();
			var deviceName:String = airCap.getMachineName();
			var userAgent:Array;
			if (deviceName != "") {
				// include device name in the user agent looking for the first ")" character as follows:
				// Mozilla/5.0 (Android; U; pt-BR<; DEVICE NAME>) AppleWebKit/533.19.4 (KHTML, like Gecko) AdobeAIR/16.0
				userAgent = urlRequest.userAgent.split(")");
				userAgent[0] += "; " + deviceName;
				urlRequest.userAgent = userAgent.join(")");
			}
			var OSVersion:String = airCap.getOSVersion();
			if (OSVersion != "") {
				// include os version in the user agent looking for the first ";" character as follows:
				// Mozilla/5.0 (Android< OSVERSION>; U; pt-BR) AppleWebKit/533.19.4 (KHTML, like Gecko) AdobeAIR/16.0
				userAgent = urlRequest.userAgent.split(";");
				userAgent[0] += " " + OSVersion;
				urlRequest.userAgent = userAgent.join(";");
			}
			var appXML:XML = NativeApplication.nativeApplication.applicationDescriptor;
			var ns:Namespace = appXML.namespace();
			// append client name and version to the end of the user agent
			urlRequest.userAgent += " " + appXML.ns::name + "/" + appXML.ns::versionNumber;
			return urlRequest.userAgent;
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
