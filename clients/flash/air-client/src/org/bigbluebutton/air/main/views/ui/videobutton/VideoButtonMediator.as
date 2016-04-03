package org.bigbluebutton.air.main.views.ui.videobutton {
	
	import flash.events.MouseEvent;
	
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.models.User;
	import org.bigbluebutton.lib.video.commands.ShareCameraSignal;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class VideoButtonMediator extends Mediator {
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var shareCameraSignal:ShareCameraSignal;
		
		[Inject]
		public var view:IVideoButton;
		
		/**
		 * Initialize listeners and Mediator initial state
		 */
		override public function initialize():void {
			(view as VideoButton).addEventListener(MouseEvent.CLICK, mouseEventClickHandler);
			userSession.userList.userChangeSignal.add(userChangeHandler);
			view.setVisibility(userSession.userList.me.hasStream);
		}
		
		/**
		 * Destroy view and listeners
		 */
		override public function destroy():void {
			(view as VideoButton).removeEventListener(MouseEvent.CLICK, mouseEventClickHandler);
			userSession.userList.userChangeSignal.remove(userChangeHandler);
			super.destroy();
			view.dispose();
			view = null;
		}
		
		/**
		 * Handle events to turnOn microphone
		 */
		private function mouseEventClickHandler(e:MouseEvent):void {
			shareCameraSignal.dispatch(false, null);
		}
		
		/**
		 * Update the view when there is a chenge in the model
		 */
		private function userChangeHandler(user:User, type:int):void {
			if (user && user.me) {
				view.setVisibility(userSession.userList.me.hasStream);
			}
		}
	}
}
