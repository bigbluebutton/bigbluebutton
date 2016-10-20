package org.bigbluebutton.air.voice.views {
	
	import flash.events.MouseEvent;
	
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.models.User;
	import org.bigbluebutton.lib.user.models.UserList;
	import org.bigbluebutton.lib.voice.commands.MicrophoneMuteSignal;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class MicButtonMediator extends Mediator {
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var microphoneMuteSignal:MicrophoneMuteSignal;
		
		[Inject]
		public var view:IMicButton;
		
		/**
		 * Initialize listeners and Mediator initial state
		 */
		override public function initialize():void {
			view.addEventListener(MouseEvent.CLICK, mouseEventClickHandler);
			userSession.userList.userChangeSignal.add(userChangeHandler);
			view.setVisibility(userSession.userList.me.voiceJoined);
			view.muted = userSession.userList.me.muted;
		}
		
		/**
		 * Destroy view and listeners
		 */
		override public function destroy():void {
			view.removeEventListener(MouseEvent.CLICK, mouseEventClickHandler);
			userSession.userList.userChangeSignal.remove(userChangeHandler);
			super.destroy();
			view.dispose();
			view = null;
		}
		
		/**
		 * Handle events to turnOn microphone
		 */
		private function mouseEventClickHandler(e:MouseEvent):void {
			microphoneMuteSignal.dispatch(userSession.userList.me);
		}
		
		/**
		 * Update the view when there is a chenge in the model
		 */
		private function userChangeHandler(user:User, type:int):void {
			if (user.me) {
				if (type == UserList.JOIN_AUDIO) {
					view.setVisibility(user.voiceJoined);
				} else if (type == UserList.MUTE) {
					view.muted = user.muted;
				}
			}
		}
	}
}
