package org.bigbluebutton.lib.main.views {
	
	import flash.events.MouseEvent;
	
	import org.bigbluebutton.lib.main.models.IMeetingData;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.models.User2x;
	import org.bigbluebutton.lib.video.commands.ShareCameraSignal;
	import org.bigbluebutton.lib.voice.commands.MicrophoneMuteSignal;
	import org.bigbluebutton.lib.voice.commands.ShareMicrophoneSignal;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class MenuButtonsMediatorBase extends Mediator {
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var view:MenuButtonsBase;
		
		[Inject]
		public var microphoneMuteSignal:MicrophoneMuteSignal;
		
		[Inject]
		public var shareCameraSignal:ShareCameraSignal;
		
		[Inject]
		public var shareMicrophoneSignal:ShareMicrophoneSignal;
		
		[Inject]
		public var meetingData:IMeetingData;
		
		public override function initialize():void {
			meetingData.users.userChangeSignal.add(userChanged);
			view.audioButton.addEventListener(MouseEvent.CLICK, audioOnOff);
			view.camButton.addEventListener(MouseEvent.CLICK, camOnOff);
			view.micButton.addEventListener(MouseEvent.CLICK, micOnOff);
			view.statusButton.addEventListener(MouseEvent.CLICK, changeStatus);
			
			updateButtons();
		}
		
		private function changeStatus(e:MouseEvent):void {
		/*var changeStatusPopUp:ChangeStatusPopUp = new ChangeStatusPopUp();
		   mediatorMap.mediate(changeStatusPopUp);
		   changeStatusPopUp.width = view.width;
		   changeStatusPopUp.height = view.height;
		   changeStatusPopUp.open(view as DisplayObjectContainer, true);
		
		   if (FlexGlobals.topLevelApplication.aspectRatio == "landscape") {
		   changeStatusPopUp.x = view.x + view.statusButton.x;
		   changeStatusPopUp.y = view.y - changeStatusPopUp.height * 2;
		   } else {
		   changeStatusPopUp.x = -(view.width - view.statusButton.x - view.statusButton.width) / 2 - (view.statusButton.width - (view.statusButton.skin as PresentationButtonSkin).backgroundEllipse.width) / 2 + 6;
		   changeStatusPopUp.y = view.y - changeStatusPopUp.height * changeStatusPopUp.statusList.dataProvider.length;
		   }
		 */
		}
		
		protected function micOnOff(e:MouseEvent):void {
			microphoneMuteSignal.dispatch(meetingData.users.me);
		}
		
		protected function audioOnOff(e:MouseEvent):void {
		}
		
		private function camOnOff(e:MouseEvent):void {
			shareCameraSignal.dispatch(!meetingData.users.me.hasStream, userSession.videoConnection.cameraPosition);
		}
		
		private function updateButtons():void {
			if (!meetingData.users.me) {
				return;
			}
			if (meetingData.users.me.hasStream) {
				view.camButton.label = "Cam off"; // ResourceManager.getInstance().getString('resources', 'menuButtons.camOff');
				view.camButton.styleName = "icon-video-off menuButton"
			} else {
				view.camButton.label = "Cam on"; // ResourceManager.getInstance().getString('resources', 'menuButtons.camOn');
				view.camButton.styleName = "icon-video menuButton"
			}
			if (meetingData.users.me.voiceJoined) {
				view.micButton.visible = view.micButton.includeInLayout = true;
				view.audioButton.styleName = "icon-audio-off menuButtonRed";
				view.audioButton.label = "Hang Up";
				
				if (!meetingData.users.me.muted) {
					view.micButton.label = "Mic on"; // ResourceManager.getInstance().getString('resources', 'menuButtons.micOn');
					view.micButton.styleName = "icon-unmute menuButton"
				} else {
					view.micButton.label = "Mic off"; // ResourceManager.getInstance().getString('resources', 'menuButtons.micOff');
					view.micButton.styleName = "icon-mute menuButton"
				}
			} else {
				view.audioButton.label = "Join";
				view.audioButton.styleName = "icon-audio-on menuButton";
				view.micButton.visible = view.micButton.includeInLayout = false;
			}
		}
		
		private function userChanged(user:User2x, property:String = null):void {
			if (user && meetingData.users.me.intId == user.intId) {
				updateButtons();
			}
		}
		
		public override function destroy():void {
			meetingData.users.userChangeSignal.remove(userChanged);
			view.audioButton.removeEventListener(MouseEvent.CLICK, audioOnOff);
			view.camButton.removeEventListener(MouseEvent.CLICK, camOnOff);
			view.micButton.removeEventListener(MouseEvent.CLICK, micOnOff);
			view.statusButton.removeEventListener(MouseEvent.CLICK, changeStatus);
			
			super.destroy();
			view = null;
		}
	}
}
