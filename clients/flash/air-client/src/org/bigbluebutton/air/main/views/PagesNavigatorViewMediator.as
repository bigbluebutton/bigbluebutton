package org.bigbluebutton.air.main.views {
	
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
	import org.bigbluebutton.air.common.views.NoTabView;
	import org.bigbluebutton.air.main.models.IUISession;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class PagesNavigatorViewMediator extends Mediator {
		
		[Inject]
		public var view:PagesNavigatorView;
		
		[Inject]
		public var uiSession:IUISession
		
		override public function initialize():void {
			NativeApplication.nativeApplication.addEventListener(KeyboardEvent.KEY_DOWN, onKeyDown, false, 0, true);
			uiSession.pageChangedSignal.add(changePage);
		}
		
		private function onKeyDown(event:KeyboardEvent):void {
			if (event.keyCode == Keyboard.BACK) {
				event.preventDefault();
				event.stopImmediatePropagation();
				if (uiSession.currentPage != PageEnum.MAIN && view.getElementAt(0) is NoTabView) {
					(view.getElementAt(0) as NoTabView).triggerLeftMenuTap(event);
				}
			}
		}
		
		protected function changePage(pageName:String, pageRemoved:Boolean = false, animation:int = TransitionAnimationEnum.APPEAR, transition:ViewTransitionBase = null):void {
			
			if (pageName == null) {
				trace("**** pageName == null");
			}
			//@fixme pageName is sometimes null, it should never happen
			trace("***** PagesNavigatorViewMediator request change page to: " + pageName);
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
			if (pageName == PageEnum.MAIN) {
				view.popAll();
				view.pushView(PageEnum.getClassfromName(pageName), null, null, transition);
			} else if (pageRemoved) {
				view.popView(transition);
			} else if (pageName != null && pageName != "") {
				view.pushView(PageEnum.getClassfromName(pageName), null, null, transition);
			}
		}
		
		protected function onTransitionStart(event:FlexEvent):void {
			uiSession.pageTransitionStartSignal.dispatch(uiSession.lastPage);
		}
		
		override public function destroy():void {
			NativeApplication.nativeApplication.removeEventListener(KeyboardEvent.KEY_DOWN, onKeyDown);
			uiSession.pageChangedSignal.remove(changePage);
			super.destroy();
			view.dispose();
			view = null;
		}
	}
}
