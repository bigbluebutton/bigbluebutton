package org.bigbluebutton.lib.presentation.models {
	
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.lib.whiteboard.models.AnnotationStatus;
	import org.bigbluebutton.lib.whiteboard.models.IAnnotation;
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public class Presentation {
		private var _fileName:String = "";
		
		private var _id:String = "";
		
		private var _slides:ArrayCollection;
		
		private var _currentSlide:Slide;
		
		private var _current:Boolean = false;
		
		private var _downloadable:Boolean = false;
		
		private var _slideChangeSignal:ISignal = new Signal();
		
		private var _loaded:Boolean = false;
		
		public function Presentation(fileName:String, id:String, numOfSlides:int, isCurrent:Boolean, downloadable:Boolean):void {
			_fileName = fileName;
			_id = id;
			_slides = new ArrayCollection();
			_current = isCurrent;
			_downloadable = downloadable;
		}
		
		public function get fileName():String {
			return _fileName;
		}
		
		public function get id():String {
			return _id;
		}
		
		public function get slides():ArrayCollection {
			return _slides;
		}
		
		public function getSlideById(slideId:String):Slide {
			for each (var slide:Slide in _slides) {
				if (slide.id == slideId) {
					return slide;
				}
			}
			
			trace("getSlideById failed: Slide not found");
			return null;
		}
		
		public function add(slide:Slide):void {
			_slides.addItem(slide);
			if (slide.current == true) {
				_currentSlide = slide;
			}
		}
		
		public function size():uint {
			return _slides.length;
		}
		
		public function get loaded():Boolean {
			return _loaded;
		}
		
		public function get currentSlide():Slide {
			return _currentSlide;
		}
		
		public function set current(b:Boolean):void {
			_current = b;
		}
		
		public function get current():Boolean {
			return _current;
		}
		
		public function get slideChangeSignal():ISignal {
			return _slideChangeSignal;
		}
		
		public function clear():void {
			_slides = new Vector.<Slide>();
		}
		
		public function setCurrentSlide(slideId:String):void {
			if (_currentSlide) {
				_currentSlide.current = false;
				_currentSlide = null;
			}
			var newCurrentSlide:Slide = getSlideById(slideId);
			if (newCurrentSlide) {
				newCurrentSlide.current = true;
				_currentSlide = newCurrentSlide;
			}
			_slideChangeSignal.dispatch();
		}
		
		public function setViewedRegion(slideId:String, x:Number, y:Number, widthPercent:Number, heightPercent:Number):Boolean {
			var slide:Slide = getSlideById(slideId);
			if (slide != null) {
				slide.setViewedRegion(x, y, widthPercent, heightPercent);
				return true;
			}
			return false;
		}
		
		/*
		public function addAnnotationHistory(slideNum:int, annotationHistory:Array):Boolean {
			var slide:Slide = getSlideAt(slideNum);
			if (slide != null) {
				for (var i:int = 0; i < annotationHistory.length; i++) {
					slide.addAnnotation(annotationHistory[i]);
				}
				return true;
			}
			return false;
		}
		
		public function addAnnotation(slideNum:int, annotation:IAnnotation):IAnnotation {
			var slide:Slide = getSlideAt(slideNum);
			if (slide != null) {
				if (annotation.status == AnnotationStatus.DRAW_START || annotation.status == AnnotationStatus.TEXT_CREATED) {
					slide.addAnnotation(annotation);
					return annotation;
				} else {
					return slide.updateAnnotation(annotation);
				}
			}
			return null;
		}
		
		public function clearAnnotations(slideNum:int):Boolean {
			var slide:Slide = getSlideAt(slideNum);
			if (slide != null) {
				slide.clearAnnotations();
				return true;
			}
			return false;
		}
		
		public function undoAnnotation(slideNum:int):IAnnotation {
			var slide:Slide = getSlideAt(slideNum);
			if (slide != null) {
				return slide.undoAnnotation()
			}
			return null;
		}
		*/
	}
}
