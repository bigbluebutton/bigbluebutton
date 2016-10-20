package org.bigbluebutton.air.main.views.pagesnavigator {
	
	import flash.desktop.NativeApplication;
	import flash.events.KeyboardEvent;
	import flash.ui.Keyboard;
	
	import mx.events.FlexEvent;
	
	import spark.transitions.CrossFadeViewTransition;
	import spark.transitions.SlideViewTransition;
	import spark.transitions.ViewTransitionBase;
	import spark.transitions.ViewTransitionDirection;
	
	import org.bigbluebutton.air.common.PageEnum;
	import org.bigbluebutton.air.common.TransitionAnimationEnum;
	import org.bigbluebutton.air.main.models.IUserUISession;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class PagesNavigatorViewMediator extends Mediator {
		
		[Inject]
		public var view:IPagesNavigatorView;
		
		[Inject]
		public var userUISession:IUserUISession
		
		override public function initialize():void {
			NativeApplication.nativeApplication.addEventListener(KeyboardEvent.KEY_DOWN, onKeyDown, false, 0, true);
			userUISession.pageChangedSignal.add(changePage);
			userUISession.pushPage(PageEnum.LOGIN);
		}
		
		private function onKeyDown(event:KeyboardEvent):void {
			if (event.keyCode == Keyboard.BACK) {
				event.preventDefault();
				event.stopImmediatePropagation();
				userUISession.pushPage(PageEnum.EXIT);
			}
		}
		
		protected function changePage(pageName:String, pageRemoved:Boolean = false, animation:int = TransitionAnimationEnum.APPEAR, transition:ViewTransitionBase = null):void {
			switch (animation) {
				case TransitionAnimationEnum.APPEAR:  {
					var appear:CrossFadeViewTransition = new CrossFadeViewTransition;
					appear.duration = 50;
					appear.addEventListener(FlexEvent.TRANSITION_START, onTransitionStart);
					transition = appear;
					break;
				}
				case TransitionAnimationEnum.SLIDE_LEFT:  {
					var slideLeft:SlideViewTransition = new SlideViewTransition();
					slideLeft.duration = 300;
					slideLeft.direction = ViewTransitionDirection.LEFT;
					slideLeft.addEventListener(FlexEvent.TRANSITION_START, onTransitionStart);
					transition = slideLeft;
					break;
				}
				case TransitionAnimationEnum.SLIDE_RIGHT:  {
					var slideRight:SlideViewTransition = new SlideViewTransition();
					slideRight.duration = 300;
					slideRight.direction = ViewTransitionDirection.RIGHT;
					slideRight.addEventListener(FlexEvent.TRANSITION_START, onTransitionStart);
					transition = slideRight;
					break;
				}
				default:  {
					break;
				}
			}
			if (pageName == PageEnum.PARTICIPANTS || pageName == PageEnum.PRESENTATION || pageName == PageEnum.VIDEO_CHAT || pageName == PageEnum.CHATROOMS) {
				view.popAll();
				view.pushView(PageEnum.getClassfromName(pageName), null, null, transition);
			} else if (pageRemoved) {
				view.popView(transition);
			} else if (pageName != null && pageName != "") {
				view.pushView(PageEnum.getClassfromName(pageName), null, null, transition);
			}
		}
		
		protected function onTransitionStart(event:FlexEvent):void {
			userUISession.pageTransitionStartSignal.dispatch(userUISession.lastPage);
		}
		
		override public function destroy():void {
			NativeApplication.nativeApplication.removeEventListener(KeyboardEvent.KEY_DOWN, onKeyDown);
			userUISession.pageChangedSignal.remove(changePage);
			super.destroy();
			view.dispose();
			view = null;
		}
	}
}
