package org.bigbluebutton.air.main.views {
	import flash.events.MouseEvent;
	
	import org.bigbluebutton.air.chat.models.GroupChat;
	import org.bigbluebutton.air.chat.models.IChatMessagesSession;
	import org.bigbluebutton.air.common.PageEnum;
	import org.bigbluebutton.air.main.models.IUISession;
	import org.bigbluebutton.air.voice.commands.ShareMicrophoneSignal;
	import org.bigbluebutton.air.voice.models.AudioTypeEnum;
	
	public class TopToolbarMediatorAIR extends TopToolbarMediatorBase {
		
		[Inject]
		public var uiSession:IUISession;
		
		[Inject]
		public var chatMessagesSession:IChatMessagesSession;
		
		[Inject]
		public var shareMicrophoneSignal:ShareMicrophoneSignal;
		
		override protected function setVisibility():void {
			if (uiSession.currentPage == PageEnum.DISCONNECT || uiSession.currentPage == PageEnum.EXIT) {
				view.visible = view.includeInLayout = false;
			} else {
				view.visible = view.includeInLayout = true;
			}
		}
		
		override protected function setTitle():void {
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
		
		override protected function leftButtonClickHandler(e:MouseEvent):void {
			if (uiSession.currentPage == PageEnum.MAIN) {
				uiSession.pushPage(PageEnum.PARTICIPANTS);
			} else if (uiSession.currentPage == PageEnum.ECHOTEST) {
				shareMicrophoneSignal.dispatch(AudioTypeEnum.LEAVE, "");
				uiSession.popPage();
			} else {
				uiSession.popPage();
			}
		}
		
		override protected function rightButtonClickHandler(e:MouseEvent):void {
			if (uiSession.currentPage == PageEnum.MAIN) {
				uiSession.pushPage(PageEnum.SETTINGS);
			} else if (uiSession && uiSession.currentPage.indexOf("Settings") > 0) {
				uiSession.popPage();
			} else {
				uiSession.pushPage(PageEnum.MAIN);
			}
		}
	}
}
