package org.bigbluebutton.lib.main.services {
	
	import flash.events.Event;
	import flash.events.HTTPStatusEvent;
	import flash.events.IOErrorEvent;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	import flash.net.URLRequestMethod;
	import flash.net.URLVariables;
	
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	
	public class ConfigService {
		protected var _successSignal:Signal = new Signal();
		
		protected var _failureSignal:Signal = new Signal();
		
		private var urlLoader:URLLoader;
		
		private var reqVars:URLVariables = new URLVariables();
		
		public function get successSignal():ISignal {
			return _successSignal;
		}
		
		public function get failureSignal():ISignal {
			return _failureSignal;
		}
		
		public function getConfig(serverUrl:String, urlRequest:URLRequest, sessionToken:String):void {
			/*
			   var p:QueryStringParameters = new QueryStringParameters();
			   p.collectParameters();
			   var sessionToken:String = p.getParameter("sessionToken");
			 */
			trace("sessionToken=" + sessionToken);
			reqVars.sessionToken = sessionToken;
			
			
			urlLoader = new URLLoader();
			
			var configUrl:String = serverUrl + "/bigbluebutton/api/configXML";
			
			var request:URLRequest = new URLRequest(configUrl);
			request.method = URLRequestMethod.GET;
			request.data = reqVars;
			
			urlLoader.addEventListener(Event.COMPLETE, handleComplete);
			urlLoader.addEventListener(HTTPStatusEvent.HTTP_STATUS, httpStatusHandler);
			urlLoader.addEventListener(IOErrorEvent.IO_ERROR, ioErrorHandler);
			urlLoader.load(request);
		
		}
		
		private function httpStatusHandler(event:HTTPStatusEvent):void {
			trace("httpStatusHandler: {0}", [event]);
		}
		
		private function ioErrorHandler(event:IOErrorEvent):void {
			trace("ioErrorHandler: {0}", [event]);
			failureSignal.dispatch(event.text);
		}
		
		private function handleComplete(e:Event):void {
			successSignal.dispatch(new XML(e.target.data));
		}
	
	}
}
