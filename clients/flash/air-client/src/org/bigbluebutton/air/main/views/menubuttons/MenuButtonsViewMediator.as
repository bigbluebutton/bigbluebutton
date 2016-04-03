package org.bigbluebutton.air.main.views.menubuttons {
	
	import com.juankpro.ane.localnotif.Notification;
	import com.juankpro.ane.localnotif.NotificationManager;
	
	import flash.desktop.NativeApplication;
	import flash.desktop.SystemIdleMode;
	import flash.events.Event;
	import flash.events.InvokeEvent;
	import flash.events.MouseEvent;
	import flash.events.StageOrientationEvent;
	import flash.events.TouchEvent;
	import flash.geom.Point;
	
	import mx.core.FlexGlobals;
	import mx.core.mx_internal;
	import mx.events.FlexEvent;
	import mx.events.ResizeEvent;
	import mx.resources.ResourceManager;
	
	import org.bigbluebutton.air.common.views.PagesENUM;
	import org.bigbluebutton.air.common.views.TransitionAnimationENUM;
	import org.bigbluebutton.air.main.models.IUserUISession;
	import org.bigbluebutton.air.main.views.skins.NavigationButtonSkin;
	import org.bigbluebutton.lib.chat.models.IChatMessagesSession;
	import org.bigbluebutton.lib.main.commands.DisconnectUserSignal;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.models.User;
	import org.bigbluebutton.lib.user.models.UserList;
	import org.bigbluebutton.lib.user.services.IUsersService;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	import spark.transitions.ViewTransitionBase;
	
	public class MenuButtonsViewMediator extends Mediator {
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var usersService:IUsersService;
		
		[Inject]
		public var chatMessagesSession:IChatMessagesSession;
		
		[Inject]
		public var userUISession:IUserUISession;
		
		[Inject]
		public var view:MenuButtonsView;
		
		[Inject]
		public var disconnectUserSignal:DisconnectUserSignal;
		
		private var notificationManager:NotificationManager = new NotificationManager();
		
		private var loggingOut:Boolean = false;
		
		public override function initialize():void {
			NativeApplication.nativeApplication.addEventListener(Event.ACTIVATE, fl_Activate);
			NativeApplication.nativeApplication.addEventListener(Event.DEACTIVATE, fl_Deactivate);
			NativeApplication.nativeApplication.addEventListener(InvokeEvent.INVOKE, onInvokeEvent);
			view.pushToTalkButton.addEventListener(FlexEvent.BUTTON_DOWN, pushToTalkOn);
			view.pushToTalkButton.addEventListener(MouseEvent.MOUSE_UP, pushToTalkOff);
			view.pushToTalkButton.addEventListener(MouseEvent.MOUSE_OUT, pushToTalkOff);
			userUISession.loadingSignal.add(loadingFinished);
			userUISession.pageChangedSignal.add(pageChanged);
			userSession.guestList.userAddedSignal.add(guestAdded);
			userSession.guestList.userRemovedSignal.add(guestRemoved);
			userSession.userList.userChangeSignal.add(userChanged);
			chatMessagesSession.newChatMessageSignal.add(updateMessagesNotification);
			userSession.presentationList.presentationChangeSignal.add(presentationChanged);
			userSession.userList.userChangeSignal.add(userChangeHandler);
			userSession.logoutSignal.add(loggingOutHandler);
			userSession.assignedDeskshareSignal.add(configDeskshare);
			userSession.pushToTalkSignal.add(pushToTalkChange);
			pushToTalkChange();
		}
		
		
		private function isPushToTalkOn() {
			var micEnabled:Boolean = (userSession.voiceStreamManager && userSession.voiceStreamManager.mic && userSession.voiceConnection.callActive) ? true : false;
			return userSession.pushToTalk && micEnabled;
		}
		
		private function pushToTalkChange():void {
			if (userSession.voiceConnection && userSession.voiceConnection.callActive) {
				userSession.voiceStreamManager.muteMicGain(userSession.pushToTalk);
			}
			view.pushToTalkButton.visible = isPushToTalkOn();
			view.pushToTalkSpacer.includeInLayout = isPushToTalkOn();
		}
		
		/**
		 * Update the view when there is a chenge in the model
		 */
		private function userChangeHandler(user:User, type:int):void {
			if (user && user.me && type == UserList.MUTE) {
				view.pushToTalkButton.enabled = !user.muted;
			}
		}
		
		private function pushToTalkOn(e:FlexEvent):void {
			userSession.voiceStreamManager.muteMicGain(false);
		}
		
		private function pushToTalkOff(e:MouseEvent):void {
			userSession.voiceStreamManager.muteMicGain(true);
		}
		
		private function onInvokeEvent(invocation:InvokeEvent):void {
			if (invocation.arguments.length > 0) {
				var url:String = invocation.arguments[0].toString();
				if (url.lastIndexOf("://") != -1) {
					userSession.joinUrl = url;
					if (userSession.mainConnection)
						userSession.mainConnection.disconnect(true);
					if (userSession.videoConnection)
						userSession.videoConnection.disconnect(true);
					if (userSession.voiceConnection)
						userSession.voiceConnection.disconnect(true);
					if (userSession.deskshareConnection)
						userSession.deskshareConnection.disconnect(true);
					FlexGlobals.topLevelApplication.mainshell.visible = false;
					userUISession.popPage();
					userUISession.pushPage(PagesENUM.LOGIN);
				}
			}
		}
		
		private function loggingOutHandler():void {
			loggingOut = true;
		}
		
		private function presentationChanged():void {
			userSession.presentationList.currentPresentation.slideChangeSignal.add(updatePresentationNotification);
		}
		
		private function updatePresentationNotification() {
			if (userUISession.currentPage != PagesENUM.PRESENTATION) {
				(view.menuPresentationButton.skin as NavigationButtonSkin).notification.visible = true;
			} else {
				(view.menuPresentationButton.skin as NavigationButtonSkin).notification.visible = false;
			}
		}
		
		private function updateMessagesNotification(userID:String, publicChat:Boolean):void {
			var notification = (view.menuChatButton.skin as NavigationButtonSkin).notification;
			if (userUISession.currentPage == PagesENUM.SPLITCHAT) {
				notification.visible = false;
			} else {
				var data = userUISession.currentPageDetails;
				var currentPageIsPublicChat:Boolean = data && data.hasOwnProperty("user") && !data.user;
				var currentPageIsPrivateChatOfTheSender:Boolean = (data is User && userID == data.userID) || (data && data.hasOwnProperty("user") && data.user && data.user.userID == userID);
				var iAmSender = (userID == userSession.userId);
				if (!iAmSender) {
					if (userUISession.currentPage != PagesENUM.CHATROOMS && !(currentPageIsPrivateChatOfTheSender && !publicChat) && !(currentPageIsPublicChat && publicChat)) {
						notification.visible = true;
					} else {
						notification.visible = false;
					}
				}
			}
		}
		
		private function pageChanged(pageName:String, pageRemoved:Boolean = false, animation:int = TransitionAnimationENUM.APPEAR, transition:ViewTransitionBase = null):void {
			if (pageName == PagesENUM.PARTICIPANTS) {
				updateGuestsNotification();
			}
			if (pageName == PagesENUM.PRESENTATION) {
				updatePresentationNotification();
			}
			if (pageName == PagesENUM.CHATROOMS || pageName == PagesENUM.SPLITCHAT) {
				(view.menuChatButton.skin as NavigationButtonSkin).notification.visible = false;
			}
		}
		
		private function updateGuestsNotification():void {
			var numberOfGuests:int = userSession.guestList.users.length;
			if (numberOfGuests > 0 && userSession.userList.me.role == User.MODERATOR && userUISession.currentPage != PagesENUM.PARTICIPANTS) {
				(view.menuParticipantsButton.skin as NavigationButtonSkin).notification.visible = true;
			} else {
				(view.menuParticipantsButton.skin as NavigationButtonSkin).notification.visible = false;
			}
		}
		
		private function guestAdded(guest:Object):void {
			updateGuestsNotification();
		}
		
		private function guestRemoved(guest:Object):void {
			if (userSession.guestList.users.length == 0) {
				(view.menuParticipantsButton.skin as NavigationButtonSkin).notification.visible = false;
			}
		}
		
		private function userChanged(user:User, property:String = null):void {
			if (user && user.me) {
				updateGuestsNotification();
			}
		}
		
		private function loadingFinished(loading:Boolean):void {
			if (!loading) {
				updateGuestsNotification();
				userUISession.loadingSignal.remove(loadingFinished);
			}
		}
		
		private function configDeskshare() {
			view.menuDeskshareButton.visible = view.menuDeskshareButton.includeInLayout = userSession.deskshareConnection.isStreaming;
			userSession.deskshareConnection.isStreamingSignal.add(onDeskshareStreamChange);
		}
		
		/**
		 * If we recieve signal that deskshare stream is on - include Deskshare button to the layout
		 */
		public function onDeskshareStreamChange(isDeskshareStreaming:Boolean):void {
			view.menuDeskshareButton.visible = view.menuDeskshareButton.includeInLayout = isDeskshareStreaming;
		}
		
		/*private function userChangeHandler(user:User, property:int):void
		   {
		   var users:ArrayCollection = userSession.userList.users;
		   var hasStream : Boolean = false;
		   if (property == UserList.HAS_STREAM )
		   {
		   if(user.hasStream)
		   {
		   hasStream = true;
		   }
		   else
		   {
		   for each(var u:User in users)
		   {
		   if(u.hasStream)
		   {
		   hasStream = true;
		   break;
		   }
		   }
		   }
		   view.menuVideoChatButton.visible = view.menuVideoChatButton.includeInLayout = hasStream;
		   }
		   }*/
		/**
		 * Unsubscribe from listening for Deskshare Streaming Signal
		 */
		public override function destroy():void {
			userSession.deskshareConnection.isStreamingSignal.remove(onDeskshareStreamChange);
		/*userSession.userList.userChangeSignal.remove(userChangeHandler);*/
		}
		
		private function fl_Activate(event:Event = null):void {
			NativeApplication.nativeApplication.systemIdleMode = SystemIdleMode.KEEP_AWAKE;
			notificationManager.cancel("running");
		}
		
		private function fl_Deactivate(event:Event):void {
			NativeApplication.nativeApplication.systemIdleMode = SystemIdleMode.NORMAL;
			if (userSession.mainConnection && !loggingOut) {
				var notification:Notification = new Notification();
				notification.body = ResourceManager.getInstance().getString('resources', 'notification.message');
				notification.title = ResourceManager.getInstance().getString('resources', 'notification.title');
				notification.fireDate = new Date((new Date()).time);
				notification.ongoing = true;
				notification.vibrate = false;
				notification.playSound = false;
				notificationManager.notifyUser("running", notification);
			}
		}
	}
}
