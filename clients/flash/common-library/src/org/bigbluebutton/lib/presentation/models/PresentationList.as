package org.bigbluebutton.lib.presentation.models {
	
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public class PresentationList {
		
		[Inject]
		public var conferenceParameters:IConferenceParameters;
		
		private var _presentations:ArrayCollection = new ArrayCollection();
		
		private var _currentPresentation:Presentation;
		
		private var _presentationChangeSignal:ISignal = new Signal();
		
		public function PresentationList() {
		}
		
		public function addPresentation(presentationName:String, numberOfSlides:int, current:Boolean):Presentation {
			trace("Adding presentation " + presentationName);
			for (var i:int = 0; i < _presentations.length; i++) {
				var p:Presentation = _presentations[i] as Presentation;
				if (p.fileName == presentationName) {
					return p;
				}
			}
			var presentation:Presentation = new Presentation(presentationName, changeCurrentPresentation, numberOfSlides, current);
			_presentations.addItem(presentation);
			return presentation;
		}
		
		public function removePresentation(presentationName:String):void {
			for (var i:int = 0; i < _presentations.length; i++) {
				var p:Presentation = _presentations[i] as Presentation;
				if (p.fileName == presentationName) {
					trace("Removing presentation " + presentationName);
					_presentations.removeItemAt(i);
				}
			}
		}
		
		public function getPresentation(presentationName:String):Presentation {
			trace("PresentProxy::getPresentation: presentationName=" + presentationName);
			for (var i:int = 0; i < _presentations.length; i++) {
				var p:Presentation = _presentations[i] as Presentation;
				if (p.fileName == presentationName) {
					return p;
				}
			}
			return null;
		}
		
		private function changeCurrentPresentation(p:Presentation):void {
			currentPresentation = p;
		}
		
		public function get currentPresentation():Presentation {
			return _currentPresentation;
		}
		
		public function set currentPresentation(p:Presentation):void {
			trace("PresentationList changing current presentation");
			if (_currentPresentation != null) {
				_currentPresentation.current = false;
			}
			_currentPresentation = p;
			_currentPresentation.current = true;
			_presentationChangeSignal.dispatch();
		}
		
		public function get presentationChangeSignal():ISignal {
			return _presentationChangeSignal;
		}
	}
}
