package org.bigbluebutton.clientcheck.service.util
{
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

	public class URLFetcher
	{
		protected var _successSignal:Signal=new Signal();
		protected var _unsuccessSignal:Signal=new Signal();
		protected var _urlRequest:URLRequest=null;
		protected var _responseUrl:String=null;

		public function get successSignal():ISignal
		{
			return _successSignal;
		}

		public function get unsuccessSignal():ISignal
		{
			return _unsuccessSignal;
		}

		public function fetch(url:String, urlRequest:URLRequest=null, dataFormat:String=URLLoaderDataFormat.TEXT):void
		{
			trace("Fetching " + url);
			_urlRequest=urlRequest;
			if (_urlRequest == null)
			{
				_urlRequest=new URLRequest();
				_urlRequest.method=URLRequestMethod.GET;
			}
			_urlRequest.url=url;

			var urlLoader:URLLoader=new URLLoader();
			urlLoader.addEventListener(Event.COMPLETE, handleComplete);
			urlLoader.addEventListener(HTTPStatusEvent.HTTP_STATUS, httpStatusHandler);
			urlLoader.addEventListener(IOErrorEvent.IO_ERROR, ioErrorHandler);
			urlLoader.dataFormat=dataFormat;
			urlLoader.load(_urlRequest);
		}

		private function httpStatusHandler(e:HTTPStatusEvent):void
		{
			// do nothing here
		}

		private function handleComplete(e:Event):void
		{
			successSignal.dispatch(e.target.data, _responseUrl, _urlRequest);
		}

		private function ioErrorHandler(e:IOErrorEvent):void
		{
			trace(ObjectUtil.toString(e));
			unsuccessSignal.dispatch(e.text);
		}
	}
}
