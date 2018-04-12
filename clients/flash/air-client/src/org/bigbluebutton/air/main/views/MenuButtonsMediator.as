package org.bigbluebutton.air.main.views {
	
	import flash.events.MouseEvent;
	
	import spark.components.Alert;
	import spark.components.CalloutPosition;
	
	import org.bigbluebutton.air.common.PageEnum;
	import org.bigbluebutton.air.main.models.IConferenceParameters;
	import org.bigbluebutton.air.main.models.IMedia;
	import org.bigbluebutton.air.main.models.IMeetingData;
	import org.bigbluebutton.air.main.models.IUISession;
	import org.bigbluebutton.air.user.models.UserRole;
	import org.bigbluebutton.air.video.commands.ShareCameraSignal;
	import org.bigbluebutton.air.video.models.WebcamStreamInfo;
	import org.bigbluebutton.air.voice.commands.MicrophoneMuteSignal;
	import org.bigbluebutton.air.voice.commands.ShareMicrophoneSignal;
	import org.bigbluebutton.air.voice.models.AudioTypeEnum;
	import org.bigbluebutton.air.voice.models.VoiceUser;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	import robotlegs.bender.extensions.mediatorMap.api.IMediatorMap;
	
	public class MenuButtonsMediator extends Mediator {
		
		[Inject]
		public var view:MenuButtons;
		
		[Inject]
		public var mediatorMap:IMediatorMap;
		
		[Inject]
		public var shareMicrophoneSignal:ShareMicrophoneSignal;
		
		[Inject]
		public var microphoneMuteSignal:MicrophoneMuteSignal;
		
		[Inject]
		public var shareCameraSignal:ShareCameraSignal;
		
		[Inject]
		public var meetingData:IMeetingData;
		
		[Inject]
		public var media:IMedia;
		
		[Inject]
		public var conferenceParameters:IConferenceParameters;
		
		[Inject]
		public var uiSession:IUISession;
		
		public override function initialize():void {
			meetingData.voiceUsers.userChangeSignal.add(onVoiceUserChanged);
			meetingData.webcams.webcamChangeSignal.add(onWebcamChange);
			
			media.cameraPermissionSignal.add(onCameraPermission);
			media.microphonePermissionSignal.add(onMicrophonePermission);
			
			view.audioButton.addEventListener(MouseEvent.CLICK, audioOnOff);
			view.camButton.addEventListener(MouseEvent.CLICK, camOnOff);
			view.micButton.addEventListener(MouseEvent.CLICK, micOnOff);
			view.statusButton.addEventListener(MouseEvent.CLICK, changeStatus);
			
			updateButtons();
		}
		
		private function lockCamButtonBasedOnSetting():void {
			if (meetingData.users.me.locked && meetingData.users.me.role != UserRole.MODERATOR) {
				if (meetingData.meetingStatus.lockSettings.disableCam) {
					view.camButton.enabled = false;
				} else {
					view.camButton.enabled = true;
				}
			}
		}
		
		private function changeStatus(e:MouseEvent):void {
			var emojicallout:EmojiCallout = new EmojiCallout();
			emojicallout.horizontalPosition = CalloutPosition.MIDDLE;
			emojicallout.verticalPosition = CalloutPosition.BEFORE;
			emojicallout.open(view.statusButton, true);
		}
		
		protected function micOnOff(e:MouseEvent):void {
			muteUnmuteUser();
		}
		
		private function muteUnmuteUser():void {
			if (meetingData.voiceUsers.me != null) {
				if (meetingData.users.me.locked && meetingData.users.me.role != UserRole.MODERATOR) {
					var vu:VoiceUser = meetingData.voiceUsers.getUser(meetingData.users.me.intId);
					if (vu != null) {
						if (meetingData.meetingStatus.lockSettings.disableMic && vu.muted) {
							MobileAlert.show("Unmuting denied.");
						} else {
							microphoneMuteSignal.dispatch(meetingData.users.me.intId);
						}
					}
				} else {
					microphoneMuteSignal.dispatch(meetingData.users.me.intId);
				}
			}
		}
		
		protected function audioOnOff(e:MouseEvent):void {
			if (media.microphoneAvailable) {
				if (!media.microphonePermissionGranted) {
					media.requestMicrophonePermission();
				} else {
					joinOrLeaveAudio();
				}
			}
		}
		
		private function joinOrLeaveAudio():void {
			if (meetingData.voiceUsers.me == null) {
				if (meetingData.users.me.locked && meetingData.users.me.role != UserRole.MODERATOR && meetingData.meetingStatus.lockSettings.disableMic) {
					shareMicrophoneSignal.dispatch(AudioTypeEnum.LISTEN_ONLY, conferenceParameters.webvoiceconf);
				} else {
					uiSession.pushPage(PageEnum.AUDIO);
				}
			} else {
				shareMicrophoneSignal.dispatch(AudioTypeEnum.LEAVE, "");
			}
		}
		
		private function camOnOff(e:MouseEvent):void {
			if (meetingData.users.me.locked && meetingData.users.me.role != UserRole.MODERATOR && meetingData.meetingStatus.lockSettings.disableCam) {
				Alert.show("Sharing webcam denied.");
			} else {
				if (media.cameraAvailable) {
					if (!media.cameraPermissionGranted) {
						media.requestCameraPermission();
					} else {
						enableDisableWebcam();
					}
				}
			}
		}
		
		private function enableDisableWebcam():void {
			var noActiveWebcam:Boolean = meetingData.webcams.findWebcamsByUserId(conferenceParameters.internalUserID).length == 0;
			shareCameraSignal.dispatch(noActiveWebcam);
		}
		
		private function updateButtons():void {
			if (meetingData.webcams.findWebcamsByUserId(conferenceParameters.internalUserID).length > 0) {
				view.camButton.label = "Cam off"; // ResourceManager.getInstance().getString('resources', 'menuButtons.camOff');
				view.camButton.styleName = "icon-video-off menuButton"
			} else {
				view.camButton.label = "Cam on"; // ResourceManager.getInstance().getString('resources', 'menuButtons.camOn');
				view.camButton.styleName = "icon-video menuButton"
			}
			
			if (meetingData.voiceUsers.me) {
				view.micButton.visible = view.micButton.includeInLayout = !meetingData.voiceUsers.me.listenOnly;
				view.audioButton.styleName = "icon-audio-off menuButtonRed";
				view.audioButton.label = "Hang Up";
				
				if (meetingData.voiceUsers.me.muted) {
					view.micButton.label = "Mic off"; // ResourceManager.getInstance().getString('resources', 'menuButtons.micOff');
					view.micButton.styleName = "icon-mute menuButton";
				} else if (meetingData.voiceUsers.me.talking) {
					view.micButton.label = "Mic on"; // ResourceManager.getInstance().getString('resources', 'menuButtons.micOn');
					view.micButton.styleName = "icon-mute-filled menuButton"
				} else {
					view.micButton.label = "Mic on"; // ResourceManager.getInstance().getString('resources', 'menuButtons.micOn');
					view.micButton.styleName = "icon-unmute menuButton"
				}
			} else {
				view.audioButton.label = "Join";
				view.audioButton.styleName = "icon-audio-on menuButton";
				view.micButton.visible = view.micButton.includeInLayout = false;
			}
		}
		
		private function onVoiceUserChanged(user:VoiceUser, enum:int):void {
			if (user && user.me) {
				updateButtons();
			}
		}
		
		private function onWebcamChange(webcam:WebcamStreamInfo, enum:int):void {
			if (webcam.userId == conferenceParameters.internalUserID) {
				updateButtons();
			}
		}
		
		private function onCameraPermission(status:String):void {
			if (media.cameraPermissionGranted) {
				enableDisableWebcam();
			} else {
				Alert.show("Cannot share camera because access is disabled");
			}
		}
		
		private function onMicrophonePermission(status:String):void {
			if (media.microphonePermissionGranted) {
				joinOrLeaveAudio();
			} else {
				Alert.show("Cannot share microphone because access is disabled");
			}
		}
		
		public override function destroy():void {
			meetingData.voiceUsers.userChangeSignal.remove(onVoiceUserChanged);
			meetingData.webcams.webcamChangeSignal.remove(onWebcamChange);
			
			media.cameraPermissionSignal.remove(onCameraPermission);
			media.microphonePermissionSignal.remove(onMicrophonePermission);
			view.audioButton.removeEventListener(MouseEvent.CLICK, audioOnOff);
			view.camButton.removeEventListener(MouseEvent.CLICK, camOnOff);
			view.micButton.removeEventListener(MouseEvent.CLICK, micOnOff);
			view.statusButton.removeEventListener(MouseEvent.CLICK, changeStatus);
			
			super.destroy();
			view = null;
		}
	}
}
