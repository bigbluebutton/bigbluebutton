package org.bigbluebutton.lib.main.services {
	
	import flash.net.URLRequest;
	
	import org.bigbluebutton.lib.common.utils.URLFetcher;
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public class ConfigService {
		protected var _successSignal:Signal = new Signal();
		
		protected var _failureSignal:Signal = new Signal();
		
		public function get successSignal():ISignal {
			return _successSignal;
		}
		
		public function get failureSignal():ISignal {
			return _failureSignal;
		}
		
		public function getConfig(serverUrl:String, urlRequest:URLRequest):void {
			var configUrl:String = serverUrl + "/bigbluebutton/api/configXML?a=" + new Date().time;
			var fetcher:URLFetcher = new URLFetcher;
			fetcher.successSignal.add(onSuccess);
			fetcher.failureSignal.add(onFailure);
			fetcher.fetch(configUrl, urlRequest);
		}
		
		protected function onSuccess(data:Object, responseUrl:String, urlRequest:URLRequest):void {
			successSignal.dispatch(new XML(data));
		}
		
		protected function onFailure(reason:String):void {
			failureSignal.dispatch(reason);
		}
	}
}
