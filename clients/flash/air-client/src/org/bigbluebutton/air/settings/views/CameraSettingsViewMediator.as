package org.bigbluebutton.air.settings.views {
	
	import flash.events.MouseEvent;
	import flash.media.Camera;
	import flash.media.CameraPosition;
	
	import mx.core.FlexGlobals;
	import mx.events.ItemClickEvent;
	import mx.resources.ResourceManager;
	
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.models.User;
	import org.bigbluebutton.lib.user.models.UserList;
	import org.bigbluebutton.lib.video.commands.CameraQualitySignal;
	import org.bigbluebutton.lib.video.commands.ShareCameraSignal;
	import org.bigbluebutton.lib.video.services.VideoConnection;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class CameraSettingsViewMediator extends Mediator {
		
		[Inject]
		public var view:ICameraSettingsView;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var shareCameraSignal:ShareCameraSignal;
		
		[Inject]
		public var changeQualitySignal:CameraQualitySignal;
		
		override public function initialize():void {
			userSession.userList.userChangeSignal.add(userChangeHandler);
			var userMe:User = userSession.userList.me;
			if (Camera.getCamera() == null) {
				view.startCameraButton.label = ResourceManager.getInstance().getString('resources', 'profile.settings.camera.unavailable');
				view.startCameraButton.enabled = false;
			} else {
				view.startCameraButton.label = ResourceManager.getInstance().getString('resources', userMe.hasStream ? 'profile.settings.camera.on' : 'profile.settings.camera.off');
				view.startCameraButton.enabled = true;
			}
			if (Camera.names.length <= 1) {
				setSwapCameraButtonEnable(false);
			} else {
				if (!userMe.hasStream) {
					setSwapCameraButtonEnable(false);
				}
				view.swapCameraButton.addEventListener(MouseEvent.CLICK, mouseClickHandler);
				userSession.userList.userChangeSignal.add(userChangeHandler);
			}
			view.startCameraButton.addEventListener(MouseEvent.CLICK, onShareCameraClick);
			view.cameraQualityRadioGroup.addEventListener(ItemClickEvent.ITEM_CLICK, onCameraQualityRadioGroupClick);
			view.setCameraQuality(userSession.videoConnection.selectedCameraQuality);
			setRadioGroupEnable(userMe.hasStream);
			FlexGlobals.topLevelApplication.pageName.text = ResourceManager.getInstance().getString('resources', 'cameraSettings.title');
		}
		
		private function userChangeHandler(user:User, type:int):void {
			if (user.me) {
				if (type == UserList.HAS_STREAM) {
					view.startCameraButton.label = ResourceManager.getInstance().getString('resources', user.hasStream ? 'profile.settings.camera.on' : 'profile.settings.camera.off');
					setRadioGroupEnable(user.hasStream);
					if (Camera.names.length > 1) {
						setSwapCameraButtonEnable(user.hasStream)
					}
				}
			}
		}
		
		protected function onShareCameraClick(event:MouseEvent):void {
			view.setCameraQuality(VideoConnection.CAMERA_QUALITY_MEDIUM);
			userSession.videoConnection.selectedCameraQuality = VideoConnection.CAMERA_QUALITY_MEDIUM;
			shareCameraSignal.dispatch(!userSession.userList.me.hasStream, CameraPosition.FRONT);
		}
		
		protected function setRadioGroupEnable(enabled:Boolean):void {
			view.cameraQualityRadioGroup.enabled = enabled;
		}
		
		protected function setSwapCameraButtonEnable(enabled:Boolean):void {
			view.swapCameraButton.enabled = enabled;
		}
		
		protected function onCameraQualityRadioGroupClick(event:ItemClickEvent):void {
			switch (event.index) {
				case 0:
					changeQualitySignal.dispatch(VideoConnection.CAMERA_QUALITY_LOW);
					break;
				case 1:
					changeQualitySignal.dispatch(VideoConnection.CAMERA_QUALITY_MEDIUM);
					break;
				case 2:
					changeQualitySignal.dispatch(VideoConnection.CAMERA_QUALITY_HIGH);
					break;
				default:
					changeQualitySignal.dispatch(VideoConnection.CAMERA_QUALITY_MEDIUM);
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
		
		override public function destroy():void {
			super.destroy();
			userSession.userList.userChangeSignal.remove(userChangeHandler);
			view.startCameraButton.removeEventListener(MouseEvent.CLICK, onShareCameraClick);
			if (Camera.names.length > 1) {
				view.swapCameraButton.addEventListener(MouseEvent.CLICK, mouseClickHandler);
			}
			view.cameraQualityRadioGroup.removeEventListener(ItemClickEvent.ITEM_CLICK, onCameraQualityRadioGroupClick);
			view.dispose();
			view = null;
		}
	}
}
