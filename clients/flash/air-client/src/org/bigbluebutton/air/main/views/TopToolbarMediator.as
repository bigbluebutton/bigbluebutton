package org.bigbluebutton.air.main.views {
	import flash.events.MouseEvent;
	
	import org.bigbluebutton.air.chat.models.GroupChat;
	import org.bigbluebutton.air.chat.models.IChatMessagesSession;
	import org.bigbluebutton.air.common.PageEnum;
	import org.bigbluebutton.air.main.models.IConferenceParameters;
	import org.bigbluebutton.air.main.models.IMeetingData;
	import org.bigbluebutton.air.main.models.IUISession;
	import org.bigbluebutton.air.voice.commands.ShareMicrophoneSignal;
	import org.bigbluebutton.air.voice.models.AudioTypeEnum;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class TopToolbarMediator extends Mediator {
		
		[Inject]
		public var view:TopToolbarBase;
		
		[Inject]
		public var meetingData:IMeetingData;
		
		[Inject]
		public var conferenceParameters:IConferenceParameters;
		
		[Inject]
		public var uiSession:IUISession;
		
		[Inject]
		public var chatMessagesSession:IChatMessagesSession;
		
		[Inject]
		public var shareMicrophoneSignal:ShareMicrophoneSignal;
		
		override public function initialize():void {
			view.leftButton.addEventListener(MouseEvent.CLICK, leftButtonClickHandler);
			view.rightButton.addEventListener(MouseEvent.CLICK, rightButtonClickHandler);
			meetingData.meetingStatus.recordingStatusChangedSignal.add(onRecordingStatusChanged);
			
			setVisibility()
			setTitle();
			view.showRecording(meetingData.meetingStatus.isRecording);
		}
		
		protected function setTitle():void {
			if (!view.visible) {
				return;
			}
			if (uiSession.currentPage == PageEnum.CHAT) {
				var chatData:Object = uiSession.currentPageDetails;
				
				if (chatData != null) {
					var chat:GroupChat = chatMessagesSession.getGroupByChatId(chatData.chatId);
					if (chat != null) {
						view.titleLabel.text = chat.name;
					}
				}
			} else if (uiSession.currentPage == PageEnum.PARTICIPANTS) {
				view.titleLabel.text = "Participants";
			} else if (uiSession && uiSession.currentPage.indexOf("Settings") > 0) {
				view.titleLabel.text = uiSession.currentPage.replace(/([A-Z])/g, ' $1');
			} else if (uiSession.currentPage == PageEnum.USER_DETAILS) {
				view.titleLabel.text = "User Details";
			} else if (uiSession.currentPage == PageEnum.ECHOTEST) {
				view.titleLabel.text = "Echo Test";
			} else {
				view.titleLabel.text = conferenceParameters.meetingName;
			}
		}
		
		protected function setVisibility():void {
			if (uiSession.currentPage == PageEnum.DISCONNECT || uiSession.currentPage == PageEnum.EXIT) {
				view.visible = view.includeInLayout = false;
			} else {
				view.visible = view.includeInLayout = true;
			}
		}
		
		protected function leftButtonClickHandler(e:MouseEvent):void {
			if (uiSession.currentPage == PageEnum.MAIN) {
				uiSession.pushPage(PageEnum.PARTICIPANTS);
			} else if (uiSession.currentPage == PageEnum.ECHOTEST) {
				shareMicrophoneSignal.dispatch(AudioTypeEnum.LEAVE, "");
				uiSession.popPage();
			} else {
				uiSession.popPage();
			}
		
		}
		
		protected function rightButtonClickHandler(e:MouseEvent):void {
			if (uiSession.currentPage == PageEnum.MAIN) {
				uiSession.pushPage(PageEnum.SETTINGS);
			} else if (uiSession && uiSession.currentPage.indexOf("Settings") > 0) {
				uiSession.popPage();
			} else {
				uiSession.pushPage(PageEnum.MAIN);
			}
		}
		
		protected function onRecordingStatusChanged(isRecording:Boolean):void {
			view.showRecording(isRecording);
		}
		
		override public function destroy():void {
			view.leftButton.removeEventListener(MouseEvent.CLICK, leftButtonClickHandler);
			view.rightButton.removeEventListener(MouseEvent.CLICK, rightButtonClickHandler);
			meetingData.meetingStatus.recordingStatusChangedSignal.remove(onRecordingStatusChanged);
			
			super.destroy();
			view = null;
		}
	}
}
