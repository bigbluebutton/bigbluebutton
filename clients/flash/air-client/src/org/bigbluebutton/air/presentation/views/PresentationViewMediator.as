package org.bigbluebutton.air.presentation.views {
	
	import mx.core.FlexGlobals;
	
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.presentation.commands.LoadSlideSignal;
	import org.bigbluebutton.lib.presentation.models.Presentation;
	import org.bigbluebutton.lib.presentation.models.Slide;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class PresentationViewMediator extends Mediator {
		
		[Inject]
		public var view:IPresentationView;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var loadSlideSignal:LoadSlideSignal;
		
		private var _currentPresentation:Presentation;
		
		private var _currentSlideNum:int = -1;
		
		private var _currentSlide:Slide;
		
		override public function initialize():void {
			userSession.presentationList.presentationChangeSignal.add(presentationChangeHandler);
			setPresentation(userSession.presentationList.currentPresentation);
			FlexGlobals.topLevelApplication.backBtn.visible = false;
			FlexGlobals.topLevelApplication.profileBtn.visible = true;
		}
		
		private function displaySlide():void {
			if (_currentSlide != null) {
				_currentSlide.slideLoadedSignal.remove(slideLoadedHandler);
			}
			if (_currentPresentation != null && _currentSlideNum >= 0) {
				_currentSlide = _currentPresentation.getSlideAt(_currentSlideNum);
				if (_currentSlide != null) {
					if (_currentSlide.loaded && view != null) {
						view.setSlide(_currentSlide);
					} else {
						_currentSlide.slideLoadedSignal.add(slideLoadedHandler);
						loadSlideSignal.dispatch(_currentSlide);
					}
				}
			} else if (view != null) {
				view.setSlide(null);
			}
		}
		
		private function presentationChangeHandler():void {
			setPresentation(userSession.presentationList.currentPresentation);
		}
		
		private function slideChangeHandler():void {
			setCurrentSlideNum(_currentPresentation.currentSlideNum);
		}
		
		private function setPresentation(p:Presentation):void {
			if (_currentPresentation != null) {
				_currentPresentation.slideChangeSignal.remove(slideChangeHandler);
			}
			_currentPresentation = p;
			if (_currentPresentation != null) {
				view.setPresentationName(_currentPresentation.fileName);
				_currentPresentation.slideChangeSignal.add(slideChangeHandler);
				setCurrentSlideNum(p.currentSlideNum);
			} else {
				view.setPresentationName("");
			}
		}
		
		private function setCurrentSlideNum(n:int):void {
			_currentSlideNum = n;
			displaySlide();
		}
		
		private function slideLoadedHandler():void {
			displaySlide();
		}
		
		override public function destroy():void {
			userSession.presentationList.presentationChangeSignal.remove(presentationChangeHandler);
			if (_currentPresentation != null) {
				_currentPresentation.slideChangeSignal.remove(slideChangeHandler);
			}
			super.destroy();
			view.dispose();
			view = null;
		}
	}
}
