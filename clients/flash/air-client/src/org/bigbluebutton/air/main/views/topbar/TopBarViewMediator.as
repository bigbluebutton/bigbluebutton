package org.bigbluebutton.air.main.views.topbar {
	import assets.BackButton;
	
	import flash.events.Event;
	
	import mx.core.FlexGlobals;
	import mx.events.ResizeEvent;
	
	import org.bigbluebutton.air.common.PageEnum;
	import org.bigbluebutton.air.common.views.TransitionAnimationENUM;
	import org.bigbluebutton.air.main.models.IUserUISession;
	import org.bigbluebutton.lib.chat.models.ChatMessages;
	import org.bigbluebutton.lib.chat.models.IChatMessagesSession;
	import org.bigbluebutton.lib.chat.models.PrivateChatMessage;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.services.IUsersService;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	import spark.transitions.ViewTransitionBase;
	
	public class TopBarViewMediator extends Mediator {
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var usersService:IUsersService;
		
		[Inject]
		public var userUISession:IUserUISession;
		
		[Inject]
		public var view:TopBarView;
		
		[Inject]
		public var chatMessagesSession:IChatMessagesSession;
		
		public override function initialize():void {
			view.addEventListener(ResizeEvent.RESIZE, stageOrientationChangingHandler);
			userUISession.pageChangedSignal.add(changePage);
			chatMessagesSession.newChatMessageSignal.add(updateChatIcon);
		}
		
		private function updateChatIcon(userId:String = null, publicChat:Boolean = true):void {
			var newMessages:Boolean = (chatMessagesSession.publicChat.newMessages > 0);
			for each (var pc:PrivateChatMessage in chatMessagesSession.privateChats) {
				if (pc.privateChat.newMessages > 0) {
					newMessages = true;
				}
			}
			if (newMessages) {
				view.participantsBtn.styleName = "chatNewMessagesButtonStyle topButtonStyle";
			} else {
				view.participantsBtn.styleName = "chatButtonStyle topButtonStyle";
			}
		}
		
		
		protected function changePage(pageName:String, pageRemoved:Boolean = false, animation:int = TransitionAnimationENUM.APPEAR, transition:ViewTransitionBase = null):void {
			switch (pageName) {
				case PageEnum.PRESENTATION:
					selectLeftButton("participants");
					selectRightButton("profile");
					break;
				case PageEnum.PROFILE:
					selectLeftButton("presentation");
					selectRightButton("none");
					break;
				case PageEnum.PARTICIPANTS:
					selectLeftButton("none");
					selectRightButton("presentation");
					break;
				case PageEnum.CAMERASETTINGS:
				case PageEnum.AUDIOSETTINGS:
				case PageEnum.LOCKSETTINGS:
					selectLeftButton("back");
					selectRightButton("none");
					break;
				case PageEnum.CHAT:
					selectLeftButton("back");
					selectRightButton("presentation");
					break;
			}
		
		}
		
		private function selectRightButton(button:String = null):void {
			switch (button) {
				case "profile":
					view.profileBtn.visible = true;
					view.profileBtn.includeInLayout = true;
					view.rightPresentationBtn.visible = false;
					view.rightPresentationBtn.includeInLayout = false;
					break;
				case "presentation":
					view.profileBtn.visible = false;
					view.profileBtn.includeInLayout = false;
					view.rightPresentationBtn.visible = true;
					view.rightPresentationBtn.includeInLayout = true;
					break;
				default:
					view.profileBtn.visible = false;
					view.profileBtn.includeInLayout = false;
					view.rightPresentationBtn.visible = false;
					view.rightPresentationBtn.includeInLayout = true;
			}
		}
		
		private function selectLeftButton(button:String = null):void {
			switch (button) {
				case "participants":
					updateChatIcon();
					view.participantsBtn.visible = true;
					view.participantsBtn.includeInLayout = true;
					view.backBtn.visible = false;
					view.backBtn.includeInLayout = false;
					view.leftPresentationBtn.visible = false;
					view.leftPresentationBtn.includeInLayout = false;
					break;
				case "back":
					view.participantsBtn.visible = false;
					view.participantsBtn.includeInLayout = false;
					view.backBtn.visible = true;
					view.backBtn.includeInLayout = true;
					view.leftPresentationBtn.visible = false;
					view.leftPresentationBtn.includeInLayout = false;
					break;
				case "presentation":
					view.participantsBtn.visible = false;
					view.participantsBtn.includeInLayout = false;
					view.backBtn.visible = false;
					view.backBtn.includeInLayout = false;
					view.leftPresentationBtn.visible = true;
					view.leftPresentationBtn.includeInLayout = true;
					break;
				default:
					view.participantsBtn.visible = false;
					view.participantsBtn.includeInLayout = false;
					view.backBtn.visible = false;
					view.backBtn.includeInLayout = false;
					view.leftPresentationBtn.visible = false;
					view.leftPresentationBtn.includeInLayout = true;
			}
		}
		
		private function stageOrientationChangingHandler(e:Event):void {
			view.profileBtn.navigateTo = [PageEnum.PROFILE];
		}
		
		public override function destroy():void {
		}
	}
}
