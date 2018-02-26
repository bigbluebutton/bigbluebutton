package org.bigbluebutton.air.main.services {
	
	import com.freshplanet.nativeExtensions.AirCapabilities;
	
	import flash.desktop.NativeApplication;
	import flash.net.URLRequest;
	
	import org.bigbluebutton.lib.common.utils.URLFetcher;
	import org.bigbluebutton.lib.common.utils.URLParser;
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public class JoinService {
		protected var _successSignal:Signal = new Signal();
		
		protected var _failureSignal:Signal = new Signal();
		
		protected var _guestWaitSignal:Signal = new Signal();
		
		private static const URL_REQUEST_ERROR_TYPE:String = "TypeError";
		
		private static const URL_REQUEST_INVALID_URL_ERROR:String = "invalidURL";
		
		private static const XML_RETURN_CODE_SUCCESS:String = "SUCCESS";
		
		private static const URL_REQUEST_GENERIC_ERROR:String = "genericError";
		
		private static const XML_RETURN_CODE_FAILED:String = "FAILED";
		
		private static const JOIN_URL_EMPTY:String = "emptyJoinUrl";
		
		private static const ERROR_QUERY_PARAM:String = "errors=";
		
		private static const TOKEN_QUERY_PARAM:String = "sessionToken=";
		
		public function get successSignal():ISignal {
			return _successSignal;
		}
		
		public function get failureSignal():ISignal {
			return _failureSignal;
		}
		
		public function get guestWaitSignal():ISignal {
			return _guestWaitSignal;
		}
		
		public function join(joinUrl:String):void {
			if (joinUrl.length == 0) {
				onFailure(JOIN_URL_EMPTY);
				return;
			}
			var fetcher:URLFetcher = new URLFetcher(getUserAgent());
			fetcher.successSignal.add(onSuccess);
			fetcher.failureSignal.add(onFailure);
			fetcher.fetch(joinUrl, null, null);
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
					/* If redirect is set to false on the join url the response will be XML and there will be
					 * an auth_token in the response that can be used to join. If redirect is set to true or
					 * left off there will be a sessionToken attached to the responseURL that can be used to
					 * join. And if there is an issue with the join request there is a redirect and error
					 *  message is in the responseURL as error.
					 */
					var xml:XML = new XML(data);
					var code:String = xml.returncode.toString();
					var sessionToken:String;
					switch (code) {
						case XML_RETURN_CODE_FAILED:
							onFailure(xml.messageKey);
							break;
						case XML_RETURN_CODE_SUCCESS:
							sessionToken = xml.session_token.toString();
							if (xml.hasOwnProperty("guestStatus")) {
								var guestStatus:String = xml.guestStatus.toString();
								var waitUrl:String = xml.url.toString();
								trace("******************** GUEST STATUS = " + guestStatus + " waitUrl=" + waitUrl);
								//trace("******************** responseUrl = " + responseUrl);
								trace("******************** sessionToken = " + sessionToken);
								var waitUrlTrim:String = getServerUrl(waitUrl);
								guestWaitSignal.dispatch(waitUrlTrim, urlRequest, responseUrl, sessionToken);
							} else {
								successSignal.dispatch(urlRequest, responseUrl, sessionToken);
							}

							break;
						default:
							onFailure(URL_REQUEST_GENERIC_ERROR);
							break;
					}
				} catch (e:Error) {
					trace("The response is probably not a XML. " + e.message);
					// Need to grab either the error or the sessionToken from the response URL
					var infoIndex:int = responseUrl.indexOf(ERROR_QUERY_PARAM);
					if (infoIndex != -1) {
						var errors:String = unescape(responseUrl.substring(infoIndex + ERROR_QUERY_PARAM.length));
						trace(errors);
						onFailure(errors);
						return
					}
					infoIndex = responseUrl.indexOf(TOKEN_QUERY_PARAM);
					if (infoIndex != -1) {
						sessionToken = responseUrl.substring(infoIndex + TOKEN_QUERY_PARAM.length);
						successSignal.dispatch(urlRequest, responseUrl, sessionToken);
						return;
					}
					onFailure(URL_REQUEST_GENERIC_ERROR);
				}
			} else {
				onFailure(URL_REQUEST_GENERIC_ERROR);
			}
		}
		
		protected function getServerUrl(url:String):String {
			var pattern:RegExp = /(?P<protocol>.+):\/\/(?P<server>.+)\/client\/guest-wait.html(?P<app>.+)/;
			var result:Array = pattern.exec(url);
			return result.protocol + "://" + result.server + "/bigbluebutton/api/guestWait";
		}
		
		protected function onFailure(reason:String):void {
			failureSignal.dispatch(reason);
		}
	}
}
