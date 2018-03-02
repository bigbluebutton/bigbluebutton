package org.bigbluebutton.lib.presentation.views {
	import flash.events.Event;
	
	import mx.events.ResizeEvent;
	
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.presentation.commands.LoadSlideSignal;
	import org.bigbluebutton.lib.presentation.models.Presentation;
	import org.bigbluebutton.lib.presentation.models.Slide;
	import org.bigbluebutton.lib.presentation.models.SlideModel;
	import org.bigbluebutton.lib.presentation.utils.CursorIndicator;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class PresentationMediatorBase extends Mediator {
		
		[Inject]
		public var view:PresentationViewBase;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var loadSlideSignal:LoadSlideSignal;
		
		protected var _currentPresentation:Presentation;
		
		protected var _currentSlide:Slide;
		
		protected var _slideModel:SlideModel = new SlideModel();
		
		override public function initialize():void {
			view.addEventListener(ResizeEvent.RESIZE, viewResizeHandler);
			userSession.presentationList.presentationChangeSignal.add(presentationChangeHandler);
			userSession.presentationList.viewedRegionChangeSignal.add(viewedRegionChangeHandler);
			view.swfLoader.addEventListener(Event.COMPLETE, handleLoadingComplete);
			_slideModel.parentChange(view.width, view.height);
			setPresentation(userSession.presentationList.currentPresentation);
		}
		
		protected function displaySlide():void {
			if (_currentSlide != null) {
				_currentSlide.slideLoadedSignal.remove(slideLoadedHandler);
			}
			if (_currentPresentation != null) {
				_currentSlide = _currentPresentation.currentSlide;
				if (_currentSlide != null) {
					// @fixme: needs to be improved as the view is sometimes null
					if (_currentSlide.loaded && view != null) {
						view.setSlide(_currentSlide);
						view.wbCanvas.changeWhiteboard(_currentSlide.id);
					} else {
						_currentSlide.slideLoadedSignal.add(slideLoadedHandler);
						loadSlideSignal.dispatch(_currentSlide, _currentPresentation.id);
					}
				}
			} else if (view != null) {
				view.setSlide(null);
				view.wbCanvas.changeWhiteboard(null);
			}
		}
		
		private function viewResizeHandler(e:ResizeEvent):void {
			_slideModel.parentChange(view.width, view.height);
			resizePresentation()
		}
		
		protected function viewedRegionChangeHandler(x:Number, y:Number, widthPercent:Number, heightPercent:Number):void {
			resetSize(x, y, widthPercent, heightPercent);
		}
		
		protected function resizePresentation():void {
			if (_slideModel && view && view.swfLoader) {
				_slideModel.resetForNewSlide(view.swfLoader.contentWidth, view.swfLoader.contentHeight);
				if (userSession.presentationList.currentPresentation) {
					var currentSlide:Slide = userSession.presentationList.currentPresentation.currentSlide;
					if (currentSlide) {
						resetSize(currentSlide.x, currentSlide.y, currentSlide.widthPercent, currentSlide.heightPercent);
							//resetSize(_currentSlide.x, _currentSlide.y, _currentSlide.widthPercent, _currentSlide.heightPercent);
					}
				}
			}
		}
		
		protected function handleLoadingComplete(e:Event):void {
			resizePresentation();
		}
		
		protected function resetSize(x:Number, y:Number, widthPercent:Number, heightPercent:Number):void {
			_slideModel.calculateViewportNeededForRegion(widthPercent, heightPercent);
			_slideModel.displayViewerRegion(x, y, widthPercent, heightPercent);
			_slideModel.calculateViewportXY();
			_slideModel.displayPresenterView();
			setViewportSize();
			fitLoaderToSize();
			//fitSlideToLoader();
			zoomCanvas(view.swfLoader.x, view.swfLoader.y, view.swfLoader.width, view.swfLoader.height);
		}
		
		protected function setViewportSize():void {
			view.viewport.x = _slideModel.viewportX;
			view.viewport.y = _slideModel.viewportY;
			view.viewport.height = _slideModel.viewportH;
			view.viewport.width = _slideModel.viewportW;
		}
		
		protected function fitLoaderToSize():void {
			view.swfLoader.x = _slideModel.loaderX;
			view.swfLoader.y = _slideModel.loaderY;
			view.swfLoader.width = _slideModel.loaderW;
			view.swfLoader.height = _slideModel.loaderH;
		}
		
		protected function zoomCanvas(x:Number, y:Number, width:Number, height:Number):void {
			view.wbCanvas.moveCanvas(x, y, width, height);
		}
		
		protected function presentationChangeHandler():void {
			setPresentation(userSession.presentationList.currentPresentation);
		}
		
		protected function slideChangeHandler():void {
			setCurrentSlide();
		}
		
		protected function setPresentation(p:Presentation):void {
			if (_currentPresentation != null) {
				_currentPresentation.slideChangeSignal.remove(slideChangeHandler);
			}
			
			_currentPresentation = p;
			if (_currentPresentation != null) {
				_currentPresentation.slideChangeSignal.add(slideChangeHandler);
				setCurrentSlide();
			}
		}
		
		protected function setCurrentSlide():void {
			displaySlide();
		}
		
		protected function slideLoadedHandler():void {
			displaySlide();
		}
		
		override public function destroy():void {
			view.swfLoader.removeEventListener(Event.COMPLETE, handleLoadingComplete);
			userSession.presentationList.presentationChangeSignal.remove(presentationChangeHandler);
			userSession.presentationList.viewedRegionChangeSignal.remove(viewedRegionChangeHandler);
			if (_currentPresentation != null) {
				_currentPresentation.slideChangeSignal.remove(slideChangeHandler);
			}
			if (_currentSlide != null) {
				_currentSlide.slideLoadedSignal.remove(slideLoadedHandler);
			}
			super.destroy();
			view = null;
		}
	}
}
