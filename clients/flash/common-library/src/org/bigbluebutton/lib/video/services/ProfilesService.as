package org.bigbluebutton.lib.video.services {
	import flash.net.URLRequest;
	
	import org.bigbluebutton.lib.common.utils.URLFetcher;
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public class ProfilesService {
		protected var _successSignal:Signal = new Signal();
		
		protected var _unsuccessSignal:Signal = new Signal();
		
		public function get successSignal():ISignal {
			return _successSignal;
		}
		
		public function get unsuccessSignal():ISignal {
			return _unsuccessSignal;
		}
		
		public function getProfiles(serverUrl:String, urlRequest:URLRequest):void {
			var ProfileUrl:String = serverUrl + "/client/conf/profiles.xml?a=" + new Date().time;
			var fetcher:URLFetcher = new URLFetcher;
			fetcher.successSignal.add(onSuccess);
			fetcher.failureSignal.add(onUnsuccess);
			fetcher.fetch(ProfileUrl, urlRequest);
		}
		
		protected function onSuccess(data:Object, responseUrl:String, urlRequest:URLRequest, httpStatusCode:String = null):void {
			try {
				successSignal.dispatch(new XML(data));
			} catch (e:Error) {
				onUnsuccess("invalidXml");
			}
		}
		
		protected function onUnsuccess(reason:String):void {
			unsuccessSignal.dispatch(reason);
		}
	}
}
