package org.bigbluebutton.air.presentation.views {
	import flash.system.ApplicationDomain;
	import flash.system.LoaderContext;
	
	import mx.controls.SWFLoader;
	
	import org.bigbluebutton.air.presentation.models.Slide;
	import org.bigbluebutton.air.whiteboard.views.WhiteboardCanvas;
	
	import spark.components.Group;
	
	public class PresentationView extends Group {
		private var _viewport:Group;
		
		public function get viewport():Group {
			return _viewport;
		}
		
		private var _swfLoader:SWFLoader;
		
		public function get swfLoader():SWFLoader {
			return _swfLoader;
		}
		
		private var _wbCanvas:WhiteboardCanvas;
		
		public function get wbCanvas():WhiteboardCanvas {
			return _wbCanvas;
		}
		
		public function PresentationView() {
			super();
			
			_viewport = new Group();
			_viewport.percentWidth = 100;
			_viewport.percentHeight = 100;
			_viewport.clipAndEnableScrolling = true;
			addElement(_viewport);
			
			_swfLoader = new SWFLoader();
			_swfLoader.percentWidth = 100;
			_swfLoader.percentHeight = 100;
			_swfLoader.scaleContent = true;
			_viewport.addElement(_swfLoader);
			
			_wbCanvas = new WhiteboardCanvas();
			_viewport.addElement(_wbCanvas);
		}
		
		public function setSlide(s:Slide):void {
			if (s != null) {
				var context:LoaderContext = new LoaderContext(false, ApplicationDomain.currentDomain, null);
				context.allowCodeImport = true;
				_swfLoader.loaderContext = context;
				_swfLoader.source = s.SWFFile.source;
			} else {
				_swfLoader.source = null;
			}
		}
	}
}
