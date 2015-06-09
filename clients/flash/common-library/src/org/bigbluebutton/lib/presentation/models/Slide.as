package org.bigbluebutton.lib.presentation.models {
	
	import flash.events.Event;
	import flash.net.URLLoader;
	import flash.net.URLLoaderDataFormat;
	import flash.net.URLRequest;
	import flash.utils.ByteArray;
	import mx.controls.SWFLoader;
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public class Slide {
		private var _loaded:Boolean = false;
		
		private var _slideURI:String;
		
		private var _slideNum:Number;
		
		private var _thumbURI:String;
		
		private var _txtURI:String;
		
		private var _current:Boolean;
		
		private var _data:ByteArray;
		
		private var _swfFile:SWFLoader = new SWFLoader();
		
		private var _slideLoadedSignal:ISignal = new Signal;
		
		public function Slide(slideNum:Number, slideURI:String, thumbURI:String, txtURI:String, current:Boolean) {
			_slideNum = slideNum;
			_slideURI = slideURI;
			_thumbURI = thumbURI;
			_txtURI = txtURI;
			_current = current;
		}
		
		public function get thumb():String {
			return _thumbURI;
		}
		
		public function get slideNumber():Number {
			return _slideNum;
		}
		
		public function get data():ByteArray {
			return _data;
		}
		
		public function set data(d:ByteArray):void {
			_data = d;
			if (_data != null) {
				_loaded = true;
				slideLoadedSignal.dispatch();
			}
		}
		
		public function set swfSource(source:Object):void {
			_swfFile.source = source;
			if (_swfFile.source != null) {
				_loaded = true;
				slideLoadedSignal.dispatch();
			}
		}
		
		public function get SWFFile():SWFLoader {
			return _swfFile;
		}
		
		public function get slideURI():String {
			return _slideURI;
		}
		
		public function get loaded():Boolean {
			return _loaded;
		}
		
		public function get slideLoadedSignal():ISignal {
			return _slideLoadedSignal;
		}
		
		public function set current(b:Boolean):void {
			_current = b;
		}
		
		public function get current():Boolean {
			return _current;
		}
	}
}
