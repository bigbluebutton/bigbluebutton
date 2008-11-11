package org.bigbluebutton.modules.presentation.model
{
	import flash.events.Event;
	import flash.net.URLLoader;
	import flash.net.URLLoaderDataFormat;
	import flash.net.URLRequest;
	
	public class Slide
	{
		private var _loader:URLLoader;
		private var _loaded:Boolean = false;
		private var _uri:String;
		private var _slideHandler:Function;
		private var _slideNum:Number;
		
		public function Slide(slideNum:Number, uri:String)
		{
			_slideNum = slideNum;
			_uri = uri;
			_loader = new URLLoader();
			_loader.addEventListener(Event.COMPLETE, handleComplete);	
			_loader.dataFormat = URLLoaderDataFormat.BINARY;		
		}

		public function load(slideLoadedHandler:Function):void {
			if (_loaded) {
				slideLoadedHandler(_slideNum, _loader.data);
			} else {
				_slideHandler = slideLoadedHandler;
				_loader.load(new URLRequest(_uri));
			}
		}
		
		private function handleComplete(e:Event):void{
			_loaded = true;
			if (_slideHandler != null) {
				_slideHandler(_slideNum, _loader.data);
			}		
		}
	}
}