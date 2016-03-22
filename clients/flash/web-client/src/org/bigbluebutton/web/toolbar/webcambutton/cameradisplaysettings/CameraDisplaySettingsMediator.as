package org.bigbluebutton.web.toolbar.webcambutton.cameradisplaysettings {
	
	import flash.events.Event;
	import flash.events.KeyboardEvent;
	import flash.events.MouseEvent;
	import flash.media.Camera;
	import flash.system.Security;
	import flash.system.SecurityPanel;
	import flash.ui.Keyboard;
	
	import mx.collections.ArrayCollection;
	import mx.collections.ArrayList;
	import mx.events.CloseEvent;
	import mx.events.ListEvent;
	import mx.managers.PopUpManager;
	import mx.utils.ObjectUtil;
	
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.models.User;
	import org.bigbluebutton.lib.user.models.UserList;
	import org.bigbluebutton.lib.user.services.IUsersService;
	import org.bigbluebutton.lib.video.models.VideoProfile;
	import org.bigbluebutton.web.toolbar.webcambutton.commands.CamSettingsClosedSignal;
	import org.bigbluebutton.web.toolbar.webcambutton.commands.ShareCameraSignal;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	import spark.components.Group;
	
	public class CameraDisplaySettingsMediator extends Mediator {
		
		[Inject]
		public var view:CameraDisplaySettings;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var usersService:IUsersService;
		
		[Inject]
		public var params:IConferenceParameters;
		
		[Inject]
		public var shareCameraSignal:ShareCameraSignal;
		
		[Inject]
		public var camSettingsClosedSignal:CamSettingsClosedSignal;
		
		static public var PADDING_HORIZONTAL:Number = 6;
		
		static public var PADDING_VERTICAL:Number = 29;
		
		//private var images:Images = new Images();
		
		//private var cancelIcon:Class = images.control_play;
		
		public var selectedVideoProfile:VideoProfile;
		
		public var publishInClient:Boolean;
		
		public var defaultCamera:String = null;
		
		public var camerasArray:Object;
		
		private var camerasAvailable:ArrayList = new ArrayList();
		
		public var chromePermissionDenied:Boolean = false;
		
		public const OFF_STATE:Number = 0;
		
		public const ON_STATE:Number = 1;
		
		private var selectedCam:int;
		
		private var aspectRatio:Number = 1;
		
		private var baseIndex:int;
		
		override public function initialize():void {
			view.cmbCameraSelector.dataProvider = camerasAvailable;
			
			view.cmbVideoProfile.dataProvider = userSession.videoProfileManager.profiles;
			view.cmbCameraSelector.addEventListener(ListEvent.CHANGE, updateCamera);
			view.cmbVideoProfile.addEventListener(ListEvent.CHANGE, updateCamera);
			view.btnStartPublish.addEventListener(MouseEvent.CLICK, startPublishing);
			view.btnClosePublish.addEventListener(MouseEvent.CLICK, onCancelClicked);
			initTabIndexes();
			camerasArray = [];
			for (var i:int = 0; i < Camera.names.length; i++) {
				camerasArray.push({label: Camera.names[i], status: OFF_STATE});
			}
			onCreationComplete();
		
		}
		
		private function initTabIndexes():void {
			view.titleString.tabIndex = baseIndex;
			view.cmbCameraSelector.tabIndex = baseIndex + 1;
			view.cmbVideoProfile.tabIndex = baseIndex + 2;
			view.btnStartPublish.tabIndex = baseIndex + 3;
			view.btnClosePublish.tabIndex = baseIndex + 4;
		
		}
		
		private function onCreationComplete():void {
			view.tabIndex = 51;
			//if (defaultCamera != null) {
			var indexDefault:int = 0;
			for (var i:int = 0; i < Camera.names.length; i++) {
				if (camerasArray[i].status == OFF_STATE) {
					var myObj:Object = {}
					myObj.label = camerasArray[i].label;
					myObj.index = String(i);
					camerasAvailable.addItem(myObj);
					if (myObj.index == defaultCamera)
						indexDefault = camerasAvailable.length - 1;
				}
			}
			view.cmbCameraSelector.selectedIndex = indexDefault;
			//	defaultCamera = null;
			//} else {
			//	view.cmbCameraSelector.selectedIndex = 0;
			//}
			
			var idx:int = 0;
			trace("");
			var defaultProfile:VideoProfile = userSession.videoProfileManager.defaultVideoProfile;
			for each (var value:VideoProfile in userSession.videoProfileManager.profiles) {
				if (value.id == defaultProfile.id) {
					view.cmbVideoProfile.selectedIndex = idx;
				}
				idx++;
			}
			
			if (userSession.videoProfileManager.profiles.length > 1) {
				showResControls(true);
			}
			
			if (Camera.names.length > 1) {
				showVideoControls(true);
			}
			view.cmbCameraSelector.selectedIndex = view.camInvoked;
			updateCamera();
		}
		
		private function showVideoControls(show:Boolean):void {
			if (show) {
				view.visible = true;
				view.btnStartPublish.visible = true;
			} else {
				view.width = 0;
				view.height = 0;
				view.btnStartPublish.visible = false;
				view.visible = false;
			}
		}
		
		private function updateCamera(e:ListEvent = null):void {
			selectedVideoProfile = view.cmbVideoProfile.selectedItem as VideoProfile;
			if (camerasAvailable.length > view.cmbCameraSelector.selectedIndex) {
				selectedCam = camerasAvailable.getItemAt(view.cmbCameraSelector.selectedIndex).index;
			} else {
				selectedCam = -1;
			}
			setAspectRatio(selectedVideoProfile.width, selectedVideoProfile.height);
			view._video.successCallback = function():void {
				view.btnStartPublish.enabled = true;
			}
			view._video.chromePermissionDenied = chromePermissionDenied;
			view._video.updateCamera(selectedCam, selectedVideoProfile, view._canvas.width, view._canvas.height, true);
		}
		
		private function showResControls(show:Boolean):void {
			if (show)
				view.cmbVideoProfile.visible = true;
			else
				view.cmbVideoProfile.visible = false;
		}
		
		private function setAspectRatio(width:int, height:int):void {
			aspectRatio = (width / height);
			view.minHeight = Math.floor((view.minWidth - PADDING_HORIZONTAL) / aspectRatio) + PADDING_VERTICAL;
		}
		
		private function startPublishing(e:MouseEvent):void {
			updateCamera();
			disableCamera();
			shareCameraSignal.dispatch(true, selectedCam.toString());
			camSettingsClosedSignal.dispatch("close");
			PopUpManager.removePopUp(view);
		}
		
		private function disableCamera():void {
			if (view._video != null) {
				view._video.disableCamera();
			}
		}
		
		private function handleKeyDown(event:KeyboardEvent):void {
			if (event.charCode == Keyboard.ESCAPE) {
				disableCamera();
					//ç	view.dispatchEvent(new CloseEvent(CloseEvent.CLOSE));
			}
		}
		
		private function onCancelClicked(e:MouseEvent):void {
			disableCamera();
			camSettingsClosedSignal.dispatch("cancel");
			PopUpManager.removePopUp(view);
		}
		
		private function showCameraSettings():void {
			Security.showSettings(SecurityPanel.CAMERA);
		}
		
		override public function destroy():void {
			super.destroy();
			view = null;
		}
	}
}

