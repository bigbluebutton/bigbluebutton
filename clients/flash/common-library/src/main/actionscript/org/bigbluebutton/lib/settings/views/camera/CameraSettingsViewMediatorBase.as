package org.bigbluebutton.lib.settings.views.camera {
	
	import mx.collections.ArrayCollection;
	import mx.events.ItemClickEvent;
	
	import org.bigbluebutton.lib.common.models.ISaveData;
	import org.bigbluebutton.lib.main.models.IMeetingData;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.models.User2x;
	import org.bigbluebutton.lib.video.models.VideoProfile;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	import spark.events.IndexChangeEvent;
	
	public class CameraSettingsViewMediatorBase extends Mediator {
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var meetingData:IMeetingData;
		
		[Inject]
		public var view:CameraSettingsViewBase;
		
		[Inject]
		public var saveData:ISaveData;
		
		protected var dataProvider:ArrayCollection;
		
		override public function initialize():void {
			super.initialize();
			dataProvider = new ArrayCollection();
			view.cameraProfilesList.dataProvider = dataProvider;
			displayCameraProfiles();
			
			meetingData.users.userChangeSignal.add(userChangeHandler);
			
			view.cameraProfilesList.addEventListener(IndexChangeEvent.CHANGE, onCameraQualitySelected);
		}
		
		private function displayCameraProfiles():void {
			var videoProfiles:Array = userSession.videoProfileManager.profiles;
			for each (var profile:VideoProfile in videoProfiles) {
				dataProvider.addItem(profile);
			}
			dataProvider.refresh();
			view.cameraProfilesList.selectedIndex = dataProvider.getItemIndex(userSession.videoConnection.selectedCameraQuality);
			
			userSession.lockSettings.disableCamSignal.add(disableCam);
			//setQualityListEnable(!meetingData.users.me.hasStream);
		}
		
		protected function onCameraQualitySelected(event:IndexChangeEvent):void {
			if (event.newIndex >= 0) {
				var profile:VideoProfile = dataProvider.getItemAt(event.newIndex) as VideoProfile;

				userSession.videoConnection.selectedCameraQuality = profile;

				saveData.save("cameraQuality", userSession.videoConnection.selectedCameraQuality.id);
				displayPreviewCamera();
			}
		}
		
		protected function displayPreviewCamera():void {
		}
		
		protected function userChangeHandler(user:User2x, type:int):void {
		}
		
		private function disableCam(disable:Boolean):void {
			if (disable) {
				// view.startCameraButton.enabled = false;
			} else {
				// view.startCameraButton.enabled = true;
			}
		}
		
		protected function setQualityListEnable(enabled:Boolean):void {
			view.cameraProfilesList.enabled = enabled;
		}
		
		override public function destroy():void {
			super.destroy();
			userSession.lockSettings.disableCamSignal.remove(disableCam);
			meetingData.users.userChangeSignal.remove(userChangeHandler);
			view.cameraProfilesList.removeEventListener(ItemClickEvent.ITEM_CLICK, onCameraQualitySelected);
		}
	
	}
}
