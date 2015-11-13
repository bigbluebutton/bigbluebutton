package org.bigbluebutton.web.toolbar {
	import flash.accessibility.Accessibility;
	import flash.display.DisplayObject;
	import flash.events.MouseEvent;
	import flash.events.TimerEvent;
	import flash.geom.Point;
	import flash.net.URLRequest;
	import flash.net.navigateToURL;
	import flash.system.Capabilities;
	import flash.utils.Timer;
	
	import mx.accessibility.AlertAccImpl;
	import mx.core.FlexGlobals;
	import mx.core.UIComponent;
	import mx.events.CloseEvent;
	import mx.managers.PopUpManager;
	import mx.resources.ResourceManager;
	import mx.utils.ObjectUtil;
	
	import org.bigbluebutton.lib.main.commands.DisconnectUserSignal;
	import org.bigbluebutton.lib.main.models.ConferenceParameters;
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.main.utils.DisconnectEnum;
	import org.bigbluebutton.lib.user.services.IUsersService;
	import org.bigbluebutton.web.shortcuthelp.ShortcutHelpWindow;
	import org.bigbluebutton.web.shortcuthelp.ShortcutHelpWindow;
	import org.bigbluebutton.web.toolbar.micbutton.toolbarbutton.ToolbarButton;
	import org.bigbluebutton.web.toolbar.webcambutton.cameradisplaysettings.CameraDisplaySettings;
	import org.bigbluebutton.web.toolbar.webcambutton.toolbarpopupbutton.ToolbarPopupButton;
	import org.bigbluebutton.web.util.i18n.ResourceUtil;
	import org.osflash.signals.Signal;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	import spark.components.Alert;
	
	public class MainToolbarViewMediator extends Mediator {
		
		[Inject]
		public var view:MainToolbarView;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var usersService:IUsersService;
		
		[Inject]
		public var params:IConferenceParameters;
		
		[Inject]
		public var disconnectUserSignal:DisconnectUserSignal;
		
		[Inject]
		public var conferenceParameters:IConferenceParameters;
		
		private var scWindow:org.bigbluebutton.web.shortcuthelp.ShortcutHelpWindow;
		
		private var baseIndex:int;
		
		private var numButtons:int;
		
		private var DEFAULT_HELP_URL:String = "http://www.bigbluebutton.org/content/videos";
		
		override public function initialize():void {
			if (Capabilities.hasAccessibility) {
				AlertAccImpl.enableAccessibility();
			}
			
			baseIndex = 101;
			numButtons = 0;
			
			// Accessibility isn't active till a few second after the client starts to load so we need a delay
			var timer:Timer = new Timer(3000, 1);
			timer.addEventListener(TimerEvent.TIMER, checkAccessiblity);
			timer.start();
			
			if (view.width < 800) {
				view.meetingNameLbl.visible = false;
				//	shortcutKeysBtn.visible = false;
				view.helpBtn.visible = false;
				//		muteMeBtn.visible = false;
				view.meetingNameLbl.width = 0;
				//	shortcutKeysBtn.width = 0;
				view.helpBtn.width = 0;
			}
			
			
			view.usersLinkBtn.addEventListener(MouseEvent.CLICK, usersButtonClicked);
			view.helpBtn.addEventListener(MouseEvent.CLICK, onHelpButtonClicked);
			view.btnLogout.addEventListener(MouseEvent.CLICK, confirmLogout);
			view.shortcutKeysBtn.addEventListener(MouseEvent.CLICK, openShortcutHelpWindow);
			setTabIndexes();
			params.changedSignal.add(retrieveMeetingName);
			retrieveMeetingName();
			userSession.successJoiningMeetingSignal.add(addButtons);
		}
		
		private function addButtons():void {
			addAudioButton();
			addVideoButton();
		}
		
		
		private function retrieveMeetingName():void {
			//if (toolbarOptions.showMeetingName) {
			var meetingTitle:String = params.meetingName;
			if (meetingTitle != null) {
				view.meetingNameLbl.text = meetingTitle;
				params.changedSignal.remove(retrieveMeetingName);
			}
			//	}
		}
		
		private function setTabIndexes() {
			view.usersLinkBtn.tabIndex = baseIndex + 1;
			view.webcamLinkButton.tabIndex = baseIndex + 2;
			view.presentationLinkBtn.tabIndex = baseIndex + 3;
			view.chatLinkBtn.tabIndex = baseIndex + 4;
			view.shortcutKeysBtn.tabIndex = baseIndex + numButtons + 13;
			view.helpBtn.tabIndex = baseIndex + numButtons + 14;
			view.btnLogout.tabIndex = baseIndex + numButtons + 15;
		}
		
		
		private function usersButtonClicked(e:MouseEvent):void {
			//dispatcher.dispatchEvent(new ShortcutEvent(ShortcutEvent.FOCUS_USERS_WINDOW));
		}
		
		private function onQuickLinkClicked(window:String):void {
			//var dispatcher:Dispatcher = new Dispatcher();
			switch (window) {
				case "users":
					break;
				case "webcams":
					//dispatcher.dispatchEvent(new ShortcutEvent(ShortcutEvent.FOCUS_VIDEO_WINDOW));
					break;
				case "presentation":
					//dispatcher.dispatchEvent(new ShortcutEvent(ShortcutEvent.FOCUS_PRESENTATION_WINDOW));
					break;
				case "chat":
					//dispatcher.dispatchEvent(new ShortcutEvent(ShortcutEvent.FOCUS_CHAT_WINDOW));
					break;
			}
		}
		
		/*private function handleAddToolbarButtonEvent(event:ToolbarButtonEvent):void {
		   // Find out how to import accessibility into custom components; even though the ToolbarButtons are buttons, they don't seem to have a tabIndex
		   if (event.location == ToolbarButtonEvent.TOP_TOOLBAR) {
		   var index:int;
		   var added:int = 0;
		   if (event.module == "DeskShare") {
		   index = 0;
		   } else if (event.module == "Microphone") {
		   index = 1;
		   } else if (event.module == "Webcam") {
		   index = 2;
		   }
		
		   view.addedBtns.addChild(event.button as UIComponent);
		   numButtons++;
		   realignButtons();
		   }
		   }*/
		
		private function addVideoButton():void {
			var button:ToolbarPopupButton = new ToolbarPopupButton();
			button.tabIndex = baseIndex + view.addedBtns.numChildren + 10;
			view.addedBtns.addChild(button);
		}
		
		private function addAudioButton():void {
			var button:ToolbarButton = new ToolbarButton();
			button.tabIndex = baseIndex + view.addedBtns.numChildren + 10;
			view.addedBtns.addChild(button);
		}
		
		private function realignButtons():void {
			for each (var button:UIComponent in view.addedBtns.getChildren()) {
				//var toolbarComponent:IBbbToolbarComponent = button as IBbbToolbarComponent;
				
				
				/*if (toolbarComponent.getAlignment() == ALIGN_LEFT){
				   addedBtns.setChildIndex(button, 0);
				   //(addedBtns.getChildAt(0) as Button).tabIndex = 0;
				   }
				   else if (toolbarComponent.getAlignment() == ALIGN_RIGHT){
				   addedBtns.setChildIndex(button, addedBtns.numChildren - 1);
				   //(addedBtns.getChildAt(0) as Button).tabIndex = addedBtns.numChildren - 1;
				   }*/
				button.tabIndex = baseIndex + 5;
					//for (var i:int = 0; i < addedBtns.numChildren; i++){
					//	(addedBtns.getChildAt(i) as Button).tabIndex = baseIndex + i;
					//}
			}
		}
		
		private function confirmLogout(e:MouseEvent):void {
			//if (toolbarOptions.confirmLogout) {
			// Confirm logout using built-in alert
			var alert:Alert = Alert.show(ResourceUtil.getInstance().getString('bbb.logout.confirm.message'), ResourceUtil.getInstance().getString('bbb.logout.confirm.title'), Alert.YES | Alert.NO, view, alertLogout, null, Alert.YES);
			
			var newX:Number = view.btnLogout.x + view.btnLogout.width - alert.width;
			var newY:Number = view.btnLogout.y + view.btnLogout.height + 5;
			
			alert.validateNow();
			alert.move(newX, newY);
			//Accessibility.updateProperties();
			//} else {
			//	doLogout();
			//}
		}
		
		private function alertLogout(e:CloseEvent):void {
			// Check to see if the YES button was pressed.
			if (e.detail == Alert.YES) {
				doLogout();
			}
		}
		
		public function openShortcutHelpWindow(e:MouseEvent):void {
			if (scWindow == null) {
				scWindow = new org.bigbluebutton.web.shortcuthelp.ShortcutHelpWindow();
				scWindow.width = 300;
				scWindow.height = 300;
			}
			
			if (scWindow.minimized)
				scWindow.restore();
			
			if (scWindow.maximized)
				scWindow.restore();
			
			FlexGlobals.topLevelApplication.mainCanvas.windowManager.add(scWindow);
			FlexGlobals.topLevelApplication.mainCanvas.windowManager.absPos(scWindow, FlexGlobals.topLevelApplication.mainCanvas.width / 2 - 150, FlexGlobals.topLevelApplication.mainCanvas.height / 2 - 150);
			
			scWindow.focusHead();
		}
		
		private function doLogout():void {
			disconnectUserSignal.dispatch(DisconnectEnum.CONNECTION_STATUS_USER_LOGGED_OUT);
			if (conferenceParameters.logoutUrl) {
				var urlReq:URLRequest = new URLRequest(conferenceParameters.logoutUrl);
				navigateToURL(urlReq, "_self");
			}
			//dispatchEvent(new LogoutEvent(LogoutEvent.USER_LOGGED_OUT));
		}
		
		private function onHelpButtonClicked(e:MouseEvent):void {
			//DEFAULT_HELP_URL = BBB.initConfigManager().config.help.url;
			navigateToURL(new URLRequest(DEFAULT_HELP_URL))
		}
		
		private function checkAccessiblity(e:TimerEvent):void {
			// remove the quick links if there's no screen reader active
			if (!Accessibility.active) {
				view.quickLinks.removeAllChildren();
			}
		}
		
		override public function destroy():void {
			super.destroy();
			view = null;
		}
	}
}
