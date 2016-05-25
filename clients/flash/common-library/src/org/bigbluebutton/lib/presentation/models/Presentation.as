package org.bigbluebutton.lib.presentation.models {
	
	import org.bigbluebutton.lib.whiteboard.models.AnnotationStatus;
	import org.bigbluebutton.lib.whiteboard.models.IAnnotation;
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public class Presentation {
		private var _fileName:String = "";
		
		private var _id:String = "";
		
		private var _slides:Vector.<Slide> = new Vector.<Slide>();
		
		private var _changePresentation:Function;
		
		private var _currentSlideNum:int = -1;
		
		private var _current:Boolean = false;
		
		private var _slideChangeSignal:ISignal = new Signal();
		
		private var _loaded:Boolean = false;
		
		public function Presentation(fileName:String, id:String, changePresentation:Function, numOfSlides:int, isCurrent:Boolean):void {
			_fileName = fileName;
			_id = id;
			_slides = new Vector.<Slide>(numOfSlides);
			_changePresentation = changePresentation;
			_current = isCurrent;
		}
		
		public function get fileName():String {
			return _fileName;
		}
		
		public function get id():String {
			return _id;
		}
		
		public function get slides():Vector.<Slide> {
			return _slides;
		}
		
		public function getSlideAt(num:int):Slide {
			if (_slides.length > num) {
				return _slides[num];
			}
			trace("getSlideAt failed: Slide index out of bounds");
			return null;
		}
		
		public function add(slide:Slide):void {
			_slides[slide.slideNumber - 1] = slide;
			if (slide.current == true) {
				_currentSlideNum = slide.slideNumber - 1;
			}
		}
		
		public function size():uint {
			return _slides.length;
		}
		
		public function show():void {
			_changePresentation(this);
		}
		
		public function finishedLoading(currentSlideNum:int):void {
			_loaded = true;
			_changePresentation(this, currentSlideNum);
		}
		
		public function get loaded():Boolean {
			return _loaded;
		}
		
		public function set currentSlideNum(n:int):void {
			if (_currentSlideNum >= 0) {
				_slides[_currentSlideNum].current = false;
			}
			_currentSlideNum = n - 1;
			_slides[_currentSlideNum].current = true;
			_slideChangeSignal.dispatch();
		}
		
		public function get currentSlideNum():int {
			return _currentSlideNum;
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
		
		public function setViewedRegion(slideNum:Number, x:Number, y:Number, widthPercent:Number, heightPercent:Number):Boolean {
			var slide:Slide = getSlideAt(slideNum);
			if (slide != null) {
				slide.setViewedRegion(x, y, widthPercent, heightPercent);
				return true;
			}
			return false;
		}
	}
}
