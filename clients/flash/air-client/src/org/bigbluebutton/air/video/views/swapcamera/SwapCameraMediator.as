package org.bigbluebutton.air.video.views.swapcamera {
	
	import flash.events.MouseEvent;
	import flash.media.Camera;
	import flash.media.CameraPosition;
	
	import org.bigbluebutton.air.main.models.IUserSession;
	import org.bigbluebutton.air.video.commands.ShareCameraSignal;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class SwapCameraMediator extends Mediator {
		
		[Inject]
		public var view:ISwapCameraButton;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var shareCameraSignal:ShareCameraSignal;
		
		public override function initialize():void {
			if (Camera.names.length > 1) {
				view.setVisibility(userSession.userList.me.hasStream);
				view.addEventListener(MouseEvent.CLICK, mouseClickHandler);
				userSession.userList.userChangeSignal.add(userChangeHandler);
			} else {
				view.includeInLayout = false;
			}
		}
		
		/**
		 * Raised on button click, will send signal to swap camera source
		 **/
		private function mouseClickHandler(e:MouseEvent):void {
			if (String(userSession.videoConnection.cameraPosition) == CameraPosition.FRONT) {
				shareCameraSignal.dispatch(userSession.userList.me.hasStream, CameraPosition.BACK);
			} else if (String(userSession.videoConnection.cameraPosition) == CameraPosition.BACK) {
				shareCameraSignal.dispatch(userSession.userList.me.hasStream, CameraPosition.FRONT);
			}
		}
		
		/**
		 * Update the view when there is a chenge in the model
		 */
		private function userChangeHandler(user:User, type:int):void {
			if (user.me && type == UserList.HAS_STREAM) {
				view.setVisibility(user.hasStream);
			}
		}
		
		override public function destroy():void {
			if (Camera.names.length > 1) {
				view.removeEventListener(MouseEvent.CLICK, mouseClickHandler);
				userSession.userList.userChangeSignal.remove(userChangeHandler);
			}
		}
	}
}
