package org.bigbluebutton.air.main.views.menubuttons {
	
	import com.juankpro.ane.localnotif.Notification;
	import com.juankpro.ane.localnotif.NotificationManager;
	
	import flash.desktop.NativeApplication;
	import flash.desktop.SystemIdleMode;
	import flash.display.DisplayObjectContainer;
	import flash.events.Event;
	import flash.events.InvokeEvent;
	import flash.events.MouseEvent;
	
	import mx.core.FlexGlobals;
	import mx.resources.ResourceManager;
	
	import org.bigbluebutton.air.common.views.PagesENUM;
	import org.bigbluebutton.air.main.models.IUserUISession;
	import org.bigbluebutton.air.main.views.menubuttons.changestatus.ChangeStatusPopUp;
	import org.bigbluebutton.air.main.views.skins.PresentationButtonSkin;
	import org.bigbluebutton.lib.chat.models.IChatMessagesSession;
	import org.bigbluebutton.lib.main.commands.DisconnectUserSignal;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.models.User;
	import org.bigbluebutton.lib.user.services.IUsersService;
	import org.bigbluebutton.lib.video.commands.ShareCameraSignal;
	import org.bigbluebutton.lib.voice.commands.ShareMicrophoneSignal;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	import robotlegs.bender.extensions.mediatorMap.api.IMediatorMap;
	
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
		
		[Inject]
		public var shareCameraSignal:ShareCameraSignal;
		
		[Inject]
		public var shareMicrophoneSignal:ShareMicrophoneSignal;
		
		[Inject]
		public var mediatorMap:IMediatorMap;
		
		private var notificationManager:NotificationManager = new NotificationManager();
		
		private var loggingOut:Boolean = false;
		
		public override function initialize():void {
			NativeApplication.nativeApplication.addEventListener(Event.ACTIVATE, fl_Activate);
			NativeApplication.nativeApplication.addEventListener(Event.DEACTIVATE, fl_Deactivate);
			NativeApplication.nativeApplication.addEventListener(InvokeEvent.INVOKE, onInvokeEvent);
			userUISession.loadingSignal.add(loadingFinished);
			userSession.userList.userChangeSignal.add(userChanged);
			userSession.logoutSignal.add(loggingOutHandler);
			view.camButton.addEventListener(MouseEvent.CLICK, camOnOff);
			view.micButton.addEventListener(MouseEvent.CLICK, micOnOff);
			view.statusButton.addEventListener(MouseEvent.CLICK, changeStatus);
		}
		
		private function changeStatus(e:MouseEvent):void {
			var changeStatusPopUp:ChangeStatusPopUp = new ChangeStatusPopUp();
			mediatorMap.mediate(changeStatusPopUp);
			changeStatusPopUp.width = view.width;
			changeStatusPopUp.height = view.height;
			changeStatusPopUp.open(view as DisplayObjectContainer, true);
			
			if (FlexGlobals.topLevelApplication.aspectRatio == "landscape") {
				changeStatusPopUp.x = view.x + view.statusButton.x;
				changeStatusPopUp.y = view.y - changeStatusPopUp.height * 2;
			} else {
				//(changeStatusPopUp.statusList.dataProvider.getItemAt(0) as StatusItemRenderer).icon;
				//var popUpButtonPadding = ((changeStatusPopUp.statusList.itemRenderer as StatusItemRenderer).icon.width - (changeStatusPopUp.statusList.itemRenderer as StatusItemRenderer).clearStatusIcon.width) / 2;
				//trace("++ isso " + ((changeStatusPopUp.statusList.itemRenderer as StatusItemRenderer).icon.width - (changeStatusPopUp.statusList.itemRenderer as StatusItemRenderer).clearStatusIcon.width) / 2);
				changeStatusPopUp.x = -(view.width - view.statusButton.x - view.statusButton.width) / 2 - (view.statusButton.width - (view.statusButton.skin as PresentationButtonSkin).backgroundEllipse.width) / 2 + 6;
				changeStatusPopUp.y = view.y - changeStatusPopUp.height * changeStatusPopUp.statusList.dataProvider.length;
			}
		
		}
		
		private function micOnOff(e:MouseEvent):void {
			var audioOptions:Object = new Object();
			audioOptions.shareMic = !userSession.userList.me.voiceJoined;
			audioOptions.listenOnly = false;
			shareMicrophoneSignal.dispatch(audioOptions);
		}
		
		private function camOnOff(e:MouseEvent):void {
			shareCameraSignal.dispatch(!userSession.userList.me.hasStream, userSession.videoConnection.cameraPosition);
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
		
		private function userChanged(user:User, property:String = null):void {
			if (user && user.me) {
				if (user.hasStream) {
					view.camButton.label = ResourceManager.getInstance().getString('resources', 'menuButtons.camOff');
					view.camButton.styleName = "camOffButtonStyle bottomPresentationBtnStyle"
				} else {
					view.camButton.label = ResourceManager.getInstance().getString('resources', 'menuButtons.camOn');
					view.camButton.styleName = "camOnButtonStyle bottomPresentationBtnStyle"
				}
				if (userSession.userList.me.voiceJoined) {
					view.micButton.label = ResourceManager.getInstance().getString('resources', 'menuButtons.micOff');
					view.micButton.styleName = "micOffButtonStyle bottomPresentationBtnStyle"
				} else {
					view.micButton.label = ResourceManager.getInstance().getString('resources', 'menuButtons.micOn');
					view.micButton.styleName = "micOnButtonStyle bottomPresentationBtnStyle"
				}
			}
		}
		
		private function loadingFinished(loading:Boolean):void {
			if (!loading) {
				userUISession.loadingSignal.remove(loadingFinished);
			}
		}
		
		public override function destroy():void {
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
