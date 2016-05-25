package org.bigbluebutton.lib.presentation.views {
	import flash.events.Event;
	
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.presentation.commands.LoadSlideSignal;
	import org.bigbluebutton.lib.presentation.models.Presentation;
	import org.bigbluebutton.lib.presentation.models.Slide;
	import org.bigbluebutton.lib.presentation.models.SlideModel;
	import org.bigbluebutton.lib.presentation.utils.CursorIndicator;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class PresentationMediator extends Mediator {
		
		[Inject]
		public var view:IPresentationView;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var loadSlideSignal:LoadSlideSignal;
		
		protected var _currentPresentation:Presentation;
		
		protected var _currentSlideNum:int = -1;
		
		protected var _currentSlide:Slide;
		
		protected var _slideModel:SlideModel = new SlideModel();
		
		protected var _cursor:CursorIndicator = new CursorIndicator();
		
		override public function initialize():void {
			userSession.presentationList.presentationChangeSignal.add(presentationChangeHandler);
			userSession.presentationList.viewedRegionChangeSignal.add(viewedRegionChangeHandler);
			userSession.presentationList.cursorUpdateSignal.add(cursorUpdateHandler);
			view.slide.addEventListener(Event.COMPLETE, handleLoadingComplete);
			_slideModel.parentChange(view.content.width, view.content.height);
			setPresentation(userSession.presentationList.currentPresentation);
		}
		
		protected function displaySlide():void {
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
						loadSlideSignal.dispatch(_currentSlide, _currentPresentation.id);
					}
				}
			} else if (view != null) {
				view.setSlide(null);
			}
		}
		
		protected function viewedRegionChangeHandler(x:Number, y:Number, widthPercent:Number, heightPercent:Number):void {
			resetSize(x, y, widthPercent, heightPercent);
		}
		
		protected function resizePresentation():void {
			if (_slideModel && view && view.slide) {
				_slideModel.resetForNewSlide(view.slide.contentWidth, view.slide.contentHeight);
				var currentSlide:Slide = userSession.presentationList.currentPresentation.getSlideAt(_currentSlideNum);
				if (currentSlide) {
					resetSize(currentSlide.x, currentSlide.y, currentSlide.widthPercent, currentSlide.heightPercent);
					_cursor.draw(view.viewport, userSession.presentationList.cursorXPercent, userSession.presentationList.cursorYPercent);
						//resetSize(_currentSlide.x, _currentSlide.y, _currentSlide.widthPercent, _currentSlide.heightPercent);
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
			zoomCanvas(view.slide.x, view.slide.y, view.slide.width, view.slide.height, 1 / Math.max(widthPercent / 100, heightPercent / 100));
		}
		
		protected function setViewportSize():void {
			view.viewport.x = _slideModel.viewportX;
			view.viewport.y = _slideModel.viewportY;
			view.viewport.height = _slideModel.viewportH;
			view.viewport.width = _slideModel.viewportW;
		}
		
		protected function fitLoaderToSize():void {
			view.slide.x = _slideModel.loaderX;
			view.slide.y = _slideModel.loaderY;
			view.slide.width = _slideModel.loaderW;
			view.slide.height = _slideModel.loaderH;
		}
		
		public function zoomCanvas(x:Number, y:Number, width:Number, height:Number, zoom:Number):void {
			view.whiteboardCanvas.moveCanvas(x, y, width, height, zoom);
		}
		
		protected function resizeWhiteboard():void {
			view.whiteboardCanvas.height = view.slide.height;
			view.whiteboardCanvas.width = view.slide.width;
			view.whiteboardCanvas.x = view.slide.x;
			view.whiteboardCanvas.y = view.slide.y;
		}
		
		protected function cursorUpdateHandler(xPercent:Number, yPercent:Number):void {
			_cursor.draw(view.viewport, xPercent, yPercent);
		}
		
		protected function presentationChangeHandler():void {
			setPresentation(userSession.presentationList.currentPresentation);
		}
		
		protected function slideChangeHandler():void {
			setCurrentSlideNum(userSession.presentationList.currentPresentation.currentSlideNum);
			_cursor.remove(view.viewport);
		}
		
		protected function setPresentation(p:Presentation):void {
			_currentPresentation = p;
			if (_currentPresentation != null) {
				_currentPresentation.slideChangeSignal.remove(slideChangeHandler);
				view.setPresentationName(_currentPresentation.fileName);
				_currentPresentation.slideChangeSignal.add(slideChangeHandler);
				setCurrentSlideNum(p.currentSlideNum);
			} else {
				view.setPresentationName("");
			}
		}
		
		protected function setCurrentSlideNum(n:int):void {
			_currentSlideNum = n;
			displaySlide();
		}
		
		protected function slideLoadedHandler():void {
			displaySlide();
		}
		
		override public function destroy():void {
			view.slide.removeEventListener(Event.COMPLETE, handleLoadingComplete);
			userSession.presentationList.presentationChangeSignal.remove(presentationChangeHandler);
			userSession.presentationList.viewedRegionChangeSignal.remove(viewedRegionChangeHandler);
			userSession.presentationList.cursorUpdateSignal.remove(cursorUpdateHandler);
			if (_currentPresentation != null) {
				_currentPresentation.slideChangeSignal.remove(slideChangeHandler);
			}
			super.destroy();
			view = null;
		}
	}
}
