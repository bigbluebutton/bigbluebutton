package org.bigbluebutton.lib.presentation.services {
	
	import flash.display.Loader;
	import flash.display.LoaderInfo;
	import flash.events.Event;
	import flash.events.SecurityErrorEvent;
	import flash.net.URLLoader;
	import flash.net.URLLoaderDataFormat;
	import flash.net.URLRequest;
	import flash.system.ApplicationDomain;
	import flash.system.LoaderContext;
	import flash.system.SecurityDomain;
	import flash.system.System;
	import flash.utils.ByteArray;
	import mx.controls.SWFLoader;
	import org.bigbluebutton.lib.presentation.models.Slide;
	
	public class LoadSlideService {
		private var _loader:Loader = new Loader();
		
		private var _slide:Slide;
		
		public function LoadSlideService(s:Slide) {
			trace("LoadSlideService: loading a new slide");
			_slide = s;
			_loader.contentLoaderInfo.addEventListener(Event.COMPLETE, handleLoaderComplete);
			_loader.load(new URLRequest(_slide.slideURI));
		}
		
		private function handleLoaderComplete(e:Event):void {
			var context:LoaderContext = new LoaderContext();
			context.allowCodeImport = true;
			_slide.SWFFile.loaderContext = context;
			_slide.swfSource = e.target.bytes;
			trace("LoadSlideService: loading of slide data finished successfully");
		}
	}
}
