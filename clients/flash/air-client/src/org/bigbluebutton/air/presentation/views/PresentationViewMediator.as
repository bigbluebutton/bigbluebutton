package org.bigbluebutton.air.presentation.views {
	
	import flash.events.Event;
	import flash.events.TransformGestureEvent;
	
	import mx.core.FlexGlobals;
	import mx.events.ResizeEvent;
	
	import org.bigbluebutton.air.common.views.PagesENUM;
	import org.bigbluebutton.air.main.models.IUserUISession;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.presentation.commands.LoadSlideSignal;
	import org.bigbluebutton.lib.presentation.models.Presentation;
	import org.bigbluebutton.lib.presentation.models.Slide;
	import org.bigbluebutton.lib.presentation.models.SlideModel;
	import org.bigbluebutton.lib.presentation.services.IPresentationService;
	import org.bigbluebutton.lib.presentation.utils.CursorIndicator;
	import org.bigbluebutton.lib.presentation.views.PresentationMediator;
	
	public class PresentationViewMediator extends PresentationMediator {
		
		[Inject]
		public var presentationService:IPresentationService;
		
		[Inject]
		public var userUISession:IUserUISession;
		
		override public function initialize():void {
			super.initialize();
			view.slide.addEventListener(TransformGestureEvent.GESTURE_SWIPE, swipehandler);
			FlexGlobals.topLevelApplication.stage.addEventListener(ResizeEvent.RESIZE, stageOrientationChangingHandler);
			FlexGlobals.topLevelApplication.backBtn.visible = false;
			FlexGlobals.topLevelApplication.profileBtn.visible = true;
		}
		
		private function swipehandler(e:TransformGestureEvent):void {
			if (userSession.userList.me.presenter) {
				if (e.offsetX == -1 && _currentSlideNum < _currentPresentation.slides.length - 1) {
					setCurrentSlideNum(_currentSlideNum + 1);
					presentationService.gotoSlide(_currentPresentation.id + "/" + _currentSlide.slideNumber);
				} else if (e.offsetX == 1 && _currentSlideNum > 0) {
					trace("current slide : " + _currentSlideNum);
					setCurrentSlideNum(_currentSlideNum - 1);
					presentationService.gotoSlide(_currentPresentation.id + "/" + _currentSlide.slideNumber);
				}
			}
		}
		
		private function stageOrientationChangingHandler(e:Event):void {
			if (userUISession.currentPage == PagesENUM.PRESENTATION) { //apply rotation only if user didn´t change view at the same time
				var newWidth:Number = FlexGlobals.topLevelApplication.width;
				var newHeight:Number = FlexGlobals.topLevelApplication.height - FlexGlobals.topLevelApplication.topActionBar.height - FlexGlobals.topLevelApplication.bottomMenu.height;
				_slideModel.parentChange(newWidth, newHeight);
				resizePresentation();
			}
		}
		
		override public function destroy():void {
			FlexGlobals.topLevelApplication.stage.removeEventListener(ResizeEvent.RESIZE, stageOrientationChangingHandler);
			(view as IPresentationViewAir).dispose();
			super.destroy();
		}
	}
}
