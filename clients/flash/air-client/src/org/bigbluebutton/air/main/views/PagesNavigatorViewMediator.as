package org.bigbluebutton.air.main.views {
	
	import mx.events.FlexEvent;
	
	import org.bigbluebutton.air.common.utils.PagesENUM;
	import org.bigbluebutton.air.common.utils.TransitionAnimationENUM;
	import org.bigbluebutton.air.main.models.IUserUISession;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	import spark.transitions.CrossFadeViewTransition;
	import spark.transitions.SlideViewTransition;
	import spark.transitions.ViewTransitionBase;
	import spark.transitions.ViewTransitionDirection;
	
	public class PagesNavigatorViewMediator extends Mediator {
		
		[Inject]
		public var view:IPagesNavigatorView;
		
		[Inject]
		public var userUISession:IUserUISession
		
		override public function initialize():void {
			userUISession.pageChangedSignal.add(changePage);
			userUISession.pushPage(PagesENUM.LOGIN, null, TransitionAnimationENUM.APPEAR);
		}
		
		protected function changePage(pageName:String, pageRemoved:Boolean = false, animation:int = TransitionAnimationENUM.APPEAR, transition:ViewTransitionBase = null):void {
			switch (animation) {
				case TransitionAnimationENUM.APPEAR:  {
					var appear:CrossFadeViewTransition = new CrossFadeViewTransition;
					appear.duration = 50;
					appear.addEventListener(FlexEvent.TRANSITION_START, onTransitionStart);
					transition = appear;
					break;
				}
				case TransitionAnimationENUM.SLIDE_LEFT:  {
					var slideLeft:SlideViewTransition = new SlideViewTransition();
					slideLeft.duration = 300;
					slideLeft.direction = ViewTransitionDirection.LEFT;
					slideLeft.addEventListener(FlexEvent.TRANSITION_START, onTransitionStart);
					transition = slideLeft;
					break;
				}
				case TransitionAnimationENUM.SLIDE_RIGHT:  {
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
			if (pageName == PagesENUM.PARTICIPANTS || pageName == PagesENUM.PRESENTATION || pageName == PagesENUM.VIDEO_CHAT || pageName == PagesENUM.CHATROOMS) {
				view.popAll();
				view.pushView(PagesENUM.getClassfromName(pageName), null, null, transition);
			} else if (pageRemoved) {
				view.popView(transition);
			} else if (pageName != null && pageName != "") {
				view.pushView(PagesENUM.getClassfromName(pageName), null, null, transition);
			}
		}
		
		protected function onTransitionStart(event:FlexEvent):void {
			// TODO Auto-generated method stub
			userUISession.pageTransitionStartSignal.dispatch(userUISession.lastPage);
		}
		
		override public function destroy():void {
			super.destroy();
			view.dispose();
			view = null;
		}
	}
}
