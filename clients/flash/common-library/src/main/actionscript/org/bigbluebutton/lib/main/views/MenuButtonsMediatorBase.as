package org.bigbluebutton.lib.main.views {
	
	import flash.events.MouseEvent;
	
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.models.User2x;
	import org.bigbluebutton.lib.video.commands.ShareCameraSignal;
	import org.bigbluebutton.lib.voice.commands.ShareMicrophoneSignal;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class MenuButtonsMediatorBase extends Mediator {
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var view:MenuButtonsBase;
		
		[Inject]
		public var shareCameraSignal:ShareCameraSignal;
		
		[Inject]
		public var shareMicrophoneSignal:ShareMicrophoneSignal;
		
		public override function initialize():void {
			//TODO: Listen for voice and webcam changes
			view.camButton.addEventListener(MouseEvent.CLICK, camOnOff);
			view.micButton.addEventListener(MouseEvent.CLICK, micOnOff);
			view.statusButton.addEventListener(MouseEvent.CLICK, changeStatus);
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
		
		private function micOnOff(e:MouseEvent):void {
			var audioOptions:Object = new Object();
			audioOptions.shareMic = false;//!userSession.userList.me.voiceJoined;
			audioOptions.listenOnly = false;
			shareMicrophoneSignal.dispatch(audioOptions);
		}
		
		private function camOnOff(e:MouseEvent):void {
			//shareCameraSignal.dispatch(!userSession.userList.me.hasStream, userSession.videoConnection.cameraPosition);
		}
		
		private function userChanged(user:User2x, type:int):void {
			//TODO: Need to fix MenuButton updating for new models
			/*
			if (user.me) {
				if (user.hasStream) {
					view.camButton.label = "Cam off";// ResourceManager.getInstance().getString('resources', 'menuButtons.camOff');
					view.camButton.styleName = "icon-video-off menuButton"
				} else {
					view.camButton.label = "Cam on";// ResourceManager.getInstance().getString('resources', 'menuButtons.camOn');
					view.camButton.styleName = "icon-video menuButton"
				}
				if (userSession.userList.me.voiceJoined) {
					view.micButton.label = "Mic off";// ResourceManager.getInstance().getString('resources', 'menuButtons.micOff');
					view.micButton.styleName = "icon-mute menuButton"
				} else {
					view.micButton.label = "Mic on";// ResourceManager.getInstance().getString('resources', 'menuButtons.micOn');
					view.micButton.styleName = "icon-unmute menuButton"
				}
			}
			*/
		}
		
		public override function destroy():void {
			view.camButton.removeEventListener(MouseEvent.CLICK, camOnOff);
			view.micButton.removeEventListener(MouseEvent.CLICK, micOnOff);
			view.statusButton.removeEventListener(MouseEvent.CLICK, changeStatus);
			
			super.destroy();
			view = null;
		}
	}
}
