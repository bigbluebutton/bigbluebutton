package org.bigbluebutton.lib.main.services {
	
	import flash.net.URLRequest;
	import flash.net.URLVariables;
	import org.bigbluebutton.lib.common.utils.URLFetcher;
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public class EnterService {
		protected var _successSignal:Signal = new Signal();
		
		protected var _failureSignal:Signal = new Signal();
		
		public function get successSignal():ISignal {
			return _successSignal;
		}
		
		public function get failureSignal():ISignal {
			return _failureSignal;
		}
		
		public function enter(enterUrl:String, urlRequest:URLRequest, sessionToken:String):void {
			/*
      var p:QueryStringParameters = new QueryStringParameters();
      p.collectParameters();
      var sessionToken:String = p.getParameter("sessionToken");
			*/
      var reqVars:URLVariables = new URLVariables();
      reqVars.sessionToken = sessionToken;
      
			var fetcher:URLFetcher = new URLFetcher;
			fetcher.successSignal.add(onSuccess);
			fetcher.failureSignal.add(onFailure);
			fetcher.fetch(enterUrl, urlRequest, reqVars);
		}
		
		protected function onSuccess(data:Object, responseUrl:String, urlRequest:URLRequest, httpStatusCode:Number = 0):void {
			var result:Object = JSON.parse(data as String);
			successSignal.dispatch(result.response);
		}
		
		protected function onFailure(reason:String):void {
			failureSignal.dispatch(reason);
		}
	}
}
