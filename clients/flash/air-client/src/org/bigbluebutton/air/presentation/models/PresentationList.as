package org.bigbluebutton.air.presentation.models {
	
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.air.main.models.IConferenceParameters;
	import org.bigbluebutton.air.main.models.IUserSession;
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public class PresentationList {
		
		private var _presentations:ArrayCollection = new ArrayCollection();
		
		private var _currentPresentation:Presentation;
		
		private var _presentationChangeSignal:ISignal = new Signal();
		
		private var _slideChangeSignal:ISignal = new Signal();
		
		private var _viewedRegionChangeSignal:ISignal = new Signal();
		
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
		
		public function setViewedRegion(presentationId:String, pageId:String, x:Number, y:Number, widthPercent:Number, heightPercent:Number):void {
			if (_currentPresentation != null) {
				if (_currentPresentation.setViewedRegion(pageId, x, y, widthPercent, heightPercent)) {
					_viewedRegionChangeSignal.dispatch(x, y, widthPercent, heightPercent);
				}
			}
		}
		
		public function setCurrentPresentation(presentationId:String):void {
			if (currentPresentation && currentPresentation.id == presentationId) {
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
	}
}
