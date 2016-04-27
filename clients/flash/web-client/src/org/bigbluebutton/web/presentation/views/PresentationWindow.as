package org.bigbluebutton.web.presentation.views {
	
	
	import flash.media.Video;
	import flash.system.ApplicationDomain;
	import flash.system.LoaderContext;
	
	import flexlib.scheduling.scheduleClasses.schedule_internal;
	
	import mx.collections.ArrayCollection;
	import mx.controls.SWFLoader;
	import mx.utils.ObjectUtil;
	
	import org.bigbluebutton.lib.common.views.VideoView;
	import org.bigbluebutton.lib.presentation.models.Slide;
	import org.bigbluebutton.lib.whiteboard.views.WhiteboardCanvas;
	import org.bigbluebutton.web.video.views.UserGraphicHolder;
	import org.bigbluebutton.web.window.views.BBBWindow;
	import org.osflash.signals.Signal;
	
	import spark.components.Group;
	import spark.layouts.BasicLayout;
	import spark.layouts.VerticalLayout;
	
	public class PresentationWindow extends BBBWindow {
		
		private var _slide:SWFLoader;
		
		private var _content:Group;
		
		private var _viewport:Group;
		
		private var _whiteboardCanvas:WhiteboardCanvas;
		
		private var _resizeWindowSignal:Signal = new Signal();
		
		public function PresentationWindow() {
			super();
			title = "Presentation";
			width = 300;
			height = 400;
			
			_content = new Group();
			_content.percentHeight = 100;
			_content.percentWidth = 100;
			
			var layout:VerticalLayout = new VerticalLayout();
			layout.horizontalAlign = "center";
			layout.verticalAlign = "middle";
			content.layout = layout;
			
			_viewport = new Group();
			_viewport.percentHeight = 100;
			_viewport.percentWidth = 100;
			_viewport.clipAndEnableScrolling = true;
			_viewport.layout = new BasicLayout();
			
			_slide = new SWFLoader();
			_slide.scaleContent = true;
			_slide.percentHeight = 100;
			_slide.percentWidth = 100;
			
			_whiteboardCanvas = new WhiteboardCanvas();
			
			_viewport.addElement(slide);
			_viewport.addElement(whiteboardCanvas);
			_content.addElement(viewport);
			addElement(content);
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			//leave a couple of pixels to separate the slides from the border
			_content.width = w - 2;
			_content.height = h - titleBarOverlay.height - 3;
			_resizeWindowSignal.dispatch();
		}
		
		public function setPresentationName(name:String):void {
			title = name;
		}
		
		public function setSlide(s:Slide):void {
			if (s != null) {
				var context:LoaderContext = new LoaderContext(false, ApplicationDomain.currentDomain, null);
				context.allowCodeImport = true;
				_slide.loaderContext = context;
				_slide.source = s.SWFFile.source;
			} else {
				_slide.source = null;
			}
		}
		
		public function get slide():SWFLoader {
			return _slide;
		}
		
		public function get content():Group {
			return _content;
		}
		
		public function get viewport():Group {
			return _viewport;
		}
		
		public function get whiteboardCanvas():WhiteboardCanvas {
			return _whiteboardCanvas;
		}
		
		public function get resizeWindowSignal():Signal {
			return _resizeWindowSignal;
		}
	
	}
}

