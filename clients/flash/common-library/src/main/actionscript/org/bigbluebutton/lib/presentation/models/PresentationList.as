package org.bigbluebutton.lib.presentation.models {
	
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.whiteboard.models.IAnnotation;
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public class PresentationList {
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var conferenceParameters:IConferenceParameters;
		
		private var _presentations:ArrayCollection = new ArrayCollection();
		
		private var _currentPresentation:Presentation;
		
		private var _presentationChangeSignal:ISignal = new Signal();
		
		private var _slideChangeSignal:ISignal = new Signal();
		
		private var _viewedRegionChangeSignal:ISignal = new Signal();
		
		private var _annotationHistorySignal:ISignal = new Signal();
		
		private var _annotationUpdatedSignal:ISignal = new Signal();
		
		private var _annotationUndoSignal:ISignal = new Signal();
		
		private var _annotationClearSignal:ISignal = new Signal();
		
		public function PresentationList() {
		}
		
		public function addPresentation(presentationName:String, id:String, numberOfSlides:int, current:Boolean, downloadable:Boolean):Presentation {
			trace("Adding presentation " + presentationName);
			for (var i:int = 0; i < _presentations.length; i++) {
				var p:Presentation = _presentations[i];
				if (p.id == id) {
					return p;
				}
			}
			var presentation:Presentation = new Presentation(presentationName, id, numberOfSlides, current, downloadable);
			presentation.slideChangeSignal.add(slideChangeSignal.dispatch);
			_presentations.addItem(presentation);
			return presentation;
		}
		
		public function removePresentation(presentationId:String):void {
			for (var i:int = 0; i < _presentations.length; i++) {
				var p:Presentation = _presentations[i];
				if (p.id == presentationId) {
					trace("Removing presentation " + presentationId);
					_presentations.removeItemAt(i);
				}
			}
		}
		
		public function getPresentationById(presentationId:String):Presentation {
			trace("PresentProxy::getPresentation: presentationId=" + presentationId);
			for (var i:int = 0; i < _presentations.length; i++) {
				var p:Presentation = _presentations[i];
				if (p.id == presentationId) {
					return p;
				}
			}
			return null;
		}
		
		public function addAnnotationHistory(whiteboardId:String, annotationArray:Array):void {
/*			var whiteboardIdParts:Array = whiteboardId.split("/");
			var presentationId:String = whiteboardIdParts[0];
			var pageNumber:int = parseInt(whiteboardIdParts[1]) - 1;
			var presentation:Presentation = getPresentationById(presentationId);
			if (presentation != null) {
				if (presentation.addAnnotationHistory(pageNumber, annotationArray)) {
					if (presentation == _currentPresentation && pageNumber == _currentPresentation.currentSlideNum) {
						_annotationHistorySignal.dispatch();
					}
				}
			}*/
		}
		
		public function addAnnotation(annotation:IAnnotation):void {
/*			var newAnnotation:IAnnotation = _currentPresentation.addAnnotation(_currentPresentation.currentSlideNum, annotation);
			if (newAnnotation != null) {
				_annotationUpdatedSignal.dispatch(newAnnotation);
			}*/
		}
		
		public function clearAnnotations():void {
/*			if (_currentPresentation != null && _currentPresentation.currentSlideNum >= 0) {
				if (_currentPresentation.clearAnnotations(_currentPresentation.currentSlideNum)) {
					_annotationClearSignal.dispatch();
				}
			}*/
		}
		
		public function undoAnnotation():void {
/*			if (_currentPresentation != null && _currentPresentation.currentSlideNum >= 0) {
				var removedAnnotation:IAnnotation = _currentPresentation.undoAnnotation(_currentPresentation.currentSlideNum);
				if (removedAnnotation != null) {
					_annotationUndoSignal.dispatch(removedAnnotation);
				}
			}*/
		}
		
		public function setViewedRegion(presentationId:String, pageId:String, x:Number, y:Number, widthPercent:Number, heightPercent:Number):void {
			if (_currentPresentation != null) {
				if (_currentPresentation.setViewedRegion(pageId, x, y, widthPercent, heightPercent)) {
					_viewedRegionChangeSignal.dispatch(x, y, widthPercent, heightPercent);
				}
			}
		}
		
		public function setCurrentPresentation(presentationId:String):void {
			if (currentPresentation && currentPresentation.id != presentationId) {
				return;
			}
			
			var nextPres:Presentation = getPresentationById(presentationId);
			
			if (nextPres != null) {
				if (_currentPresentation != null) {
					_currentPresentation.current = false;
				}
				_currentPresentation = nextPres;
				_currentPresentation.current = true;
				_presentationChangeSignal.dispatch();
			}
		}
		
		public function setCurrentSlide(presentationId:String, slideId:String):void {
			var pres:Presentation = getPresentationById(presentationId);
			
			if (pres != null) {
				pres.setCurrentSlide(slideId);
			}
		}
		
		public function get currentPresentation():Presentation {
			return _currentPresentation;
		}
		
		public function get presentationChangeSignal():ISignal {
			return _presentationChangeSignal;
		}
		
		public function get slideChangeSignal():ISignal {
			return _slideChangeSignal;
		}
		
		public function get viewedRegionChangeSignal():ISignal {
			return _viewedRegionChangeSignal;
		}
		
		public function get annotationHistorySignal():ISignal {
			return _annotationHistorySignal;
		}
		
		public function get annotationUpdatedSignal():ISignal {
			return _annotationUpdatedSignal;
		}
		
		public function get annotationUndoSignal():ISignal {
			return _annotationUndoSignal;
		}
		
		public function get annotationClearSignal():ISignal {
			return _annotationClearSignal;
		}
	}
}
