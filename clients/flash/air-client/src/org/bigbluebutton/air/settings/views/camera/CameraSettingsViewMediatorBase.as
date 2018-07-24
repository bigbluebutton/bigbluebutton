package org.bigbluebutton.air.settings.views.camera {
	
	import mx.collections.ArrayCollection;
	import mx.events.ItemClickEvent;
	
	import spark.events.IndexChangeEvent;
	
	import org.bigbluebutton.air.common.models.ISaveData;
	import org.bigbluebutton.air.main.models.IMeetingData;
	import org.bigbluebutton.air.main.models.IUserSession;
	import org.bigbluebutton.air.main.models.LockSettings2x;
	import org.bigbluebutton.air.user.models.User2x;
	import org.bigbluebutton.air.video.models.VideoProfile;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
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
			
			meetingData.meetingStatus.lockSettingsChangeSignal.add(onLockSettingsChangeSignal);
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
		
		private function onLockSettingsChangeSignal(newSettings:LockSettings2x):void {
			if (newSettings.disableCam) {
				//view..enabled = false;
			} else {
				//view.startCameraButton.enabled = true;
			}
		}
		
		protected function setQualityListEnable(enabled:Boolean):void {
			view.cameraProfilesList.enabled = enabled;
		}
		
		override public function destroy():void {
			super.destroy();
			meetingData.meetingStatus.lockSettingsChangeSignal.remove(onLockSettingsChangeSignal);
			meetingData.users.userChangeSignal.remove(userChangeHandler);
			view.cameraProfilesList.removeEventListener(ItemClickEvent.ITEM_CLICK, onCameraQualitySelected);
		}
	
	}
}
