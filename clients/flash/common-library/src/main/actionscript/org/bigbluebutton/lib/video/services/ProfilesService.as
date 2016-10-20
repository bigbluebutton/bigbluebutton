package org.bigbluebutton.lib.video.services {
	import flash.net.URLRequest;
	
	import org.bigbluebutton.lib.common.utils.URLFetcher;
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public class ProfilesService {
		protected var _successSignal:Signal = new Signal();
		
		protected var _failureSignal:Signal = new Signal();
		
		public function get successSignal():ISignal {
			return _successSignal;
		}
		
		public function get failureSignal():ISignal {
			return _failureSignal;
		}
		
		public function getProfiles(serverUrl:String, urlRequest:URLRequest):void {
			var ProfileUrl:String = serverUrl + "/client/conf/profiles.xml?a=" + new Date().time;
			var fetcher:URLFetcher = new URLFetcher;
			fetcher.successSignal.add(onSuccess);
			fetcher.failureSignal.add(onFailure);
			fetcher.fetch(ProfileUrl, urlRequest, null);
		}
		
		protected function onSuccess(data:Object, responseUrl:String, urlRequest:URLRequest, httpStatusCode:String = null):void {
			try {
				successSignal.dispatch(new XML(data));
			} catch (e:Error) {
				onFailure("invalidXml");
			}
		}
		
		protected function onFailure(reason:String):void {
			failureSignal.dispatch(reason);
		}
	}
}
