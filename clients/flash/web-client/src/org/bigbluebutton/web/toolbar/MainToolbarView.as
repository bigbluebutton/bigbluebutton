package org.bigbluebutton.web.toolbar {
	import mx.controls.Button;
	import mx.controls.LinkButton;
	
	public class MainToolbarView extends MainToolbar {
		
		//		import com.asfusion.mate.events.Dispatcher;
		import mx.accessibility.AlertAccImpl;
		import mx.binding.utils.BindingUtils;
		import mx.controls.Alert;
		import mx.core.IToolTip;
		import mx.core.UIComponent;
		import mx.events.CloseEvent;
		import mx.events.ToolTipEvent;
		import mx.managers.PopUpManager;
		
		
		
		/*	import org.bigbluebutton.common.IBbbToolbarComponent;
		   import org.bigbluebutton.common.LogUtil;
		   import org.bigbluebutton.common.events.CloseWindowEvent;
		   import org.bigbluebutton.common.events.OpenWindowEvent;
		   import org.bigbluebutton.common.events.ToolbarButtonEvent;
		   import org.bigbluebutton.common.events.SettingsComponentEvent;
		   import org.bigbluebutton.core.BBB;
		   import org.bigbluebutton.core.managers.UserManager;
		   import org.bigbluebutton.core.services.BandwidthMonitor;
		   import org.bigbluebutton.core.UsersUtil;
		   import org.bigbluebutton.main.events.BBBEvent;
		   import org.bigbluebutton.main.events.ConfigEvent;
		   import org.bigbluebutton.main.events.LogoutEvent;
		   import org.bigbluebutton.main.events.NetworkStatsEvent;
		   import org.bigbluebutton.main.events.SettingsEvent;
		   import org.bigbluebutton.main.events.ShortcutEvent;
		   import org.bigbluebutton.main.events.SuccessfulLoginEvent;
		   import org.bigbluebutton.main.model.LayoutOptions;
		   import org.bigbluebutton.main.model.NetworkStatsData;
		   import org.bigbluebutton.main.model.users.events.ChangeMyRole;
		   import org.bigbluebutton.main.model.users.events.ConferenceCreatedEvent;
		   import org.bigbluebutton.main.model.users.events.ConnectionFailedEvent;
		   import org.bigbluebutton.util.i18n.ResourceUtil; */
		
		/*
		 * Because of the de-centralized way buttons are added to the toolbar, there is a large gap between the tab indexes of the main buttons
		 * on the left and the tab indexes of the "other" items on the right (shortcut glossary, language slector, etc). This will make it more
		 * convenient to add future items to the tab order.
		 *
		 * - Justin Robinson, November 13 2012
		 */
		
		private var xml:XML;
		
		private var settingsComponents:Array = new Array();
		
		//	private var settingsPopup:BBBSettings = null;
		
		private function init():void {
		
			//				BindingUtils.bindSetter(refreshModeratorButtonsVisibility, UserManager.getInstance().getConference(), "record");
		}
		
		/*
		   public function displayToolbar():void {
		   toolbarOptions = new LayoutOptions();
		   toolbarOptions.parseOptions();
		   if (toolbarOptions.showToolbar) {
		   showToolbar = true;
		   } else {
		   showToolbar = false;
		   }
		
		   if (toolbarOptions.showHelpButton) {
		   showHelpBtn = true;
		   } else {
		   showHelpBtn = false;
		   }
		   if (toolbarOptions.showNetworkMonitor) {
		   initBandwidthToolTip();
		   }
		   } */
		
		
		/*		private function refreshModeratorButtonsVisibility(e:*):void {
		   showGuestSettingsButton = UsersUtil.amIModerator() && UserManager.getInstance().getConference().getMyUser() != null && !UserManager.getInstance().getConference().getMyUser().waitingForAcceptance;
		
		   showRecordButton = showGuestSettingsButton && UserManager.getInstance().getConference().record;
		   }
		 */
		public function addButton(name:String):Button {
			var btn:Button = new Button();
			btn.id = name;
			btn.label = name;
			btn.height = 20;
			btn.visible = true;
			this.addChild(btn);
			
			return btn;
		}
	
	/*	private function handleEndMeetingEvent(event:BBBEvent):void {
	   trace("Received end meeting event.");
	   doLogout();
	   }
	
	 */
	
	
	/*	private function hideToolbar(e:ConnectionFailedEvent):void {
	   if (toolbarOptions.showToolbar) {
	   this.visible = false;
	   } else {
	   this.visible = true;
	   }
	   }
	 */
	
	
	
	
	
	/*
	   private function handleRemoveToolbarButtonEvent(event:ToolbarButtonEvent):void {
	   if (addedBtns.contains(event.button as UIComponent))
	   addedBtns.removeChild(event.button as UIComponent);
	   }
	
	
	 */
	
	
	/*	private function gotConfigParameters(e:ConfigEvent):void {
	   shortcutKeysBtn.includeInLayout = shortcutKeysBtn.visible = e.config.shortcutKeysShowButton;
	   DEFAULT_HELP_URL = e.config.helpURL;
	
	   if (e.config.logo == "") {
	   hideLogo();
	   } else {
	   logo.source = e.config.logo;
	   }
	   }
	   private function onDisconnectTest():void {
	   var d:Dispatcher = new Dispatcher();
	   var e:LogoutEvent = new LogoutEvent(LogoutEvent.DISCONNECT_TEST);
	   d.dispatchEvent(e);
	   }
	
	   private function showSettingsButton(e:SettingsEvent):void {
	   var b:Button = new Button();
	   b.label = ResourceUtil.getInstance().getString('bbb.mainToolbar.settingsBtn');
	   b.toolTip = ResourceUtil.getInstance().getString('bbb.mainToolbar.settingsBtn.toolTip');
	   b.addEventListener(MouseEvent.CLICK, openSettings);
	   this.addChild(b);
	   }
	   private function openSettings(e:Event = null):void {
	   var d:Dispatcher = new Dispatcher();
	   d.dispatchEvent(new SettingsEvent(SettingsEvent.OPEN_SETTINGS_PANEL));
	   }
	
	   public function remoteShortcutClick(e:ShortcutEvent):void {
	   onShortcutButtonClick();
	   }
	
	   public function remoteLogout(e:ShortcutEvent):void {
	   confirmLogout();
	   }
	
	
	   private function focusShortcutButton(e:ShortcutEvent):void {
	   shortcutKeysBtn.setFocus();
	   }
	
	   private function focusLogoutButton(e:ShortcutEvent):void {
	   btnLogout.setFocus();
	   }'
	
	   private function onRecordingStatusChanged(event:BBBEvent):void {
	   meetingNameLbl.text = "";
	
	   if (event.payload.recording) {
	   meetingNameLbl.text = ResourceUtil.getInstance().getString('bbb.mainToolbar.recordingLabel.recording')
	   }
	
	   if (toolbarOptions.showMeetingName) {
	   var meetingTitle:String = BBB.initUserConfigManager().getMeetingTitle();
	   if (meetingTitle != null) {
	   meetingNameLbl.text += " " + meetingTitle;
	   }
	   }
	   }
	 */
	
	/*
	   private function onNetStatsButtonClick(e:Event = null):void {
	   var d:Dispatcher = new Dispatcher();
	   d.dispatchEvent(new NetworkStatsEvent(NetworkStatsEvent.OPEN_NETSTATS_WIN));
	   }
	 */
	/*
	   private function initBandwidthToolTip():void {
	   _updateBandwidthTimer.addEventListener(TimerEvent.TIMER, updateBandwidthTimerHandler);
	   _updateBandwidthTimer.start();
	   btnNetwork.addEventListener(ToolTipEvent.TOOL_TIP_SHOW, bwToolTipShowHandler);
	   btnNetwork.addEventListener(ToolTipEvent.TOOL_TIP_END, bwToolTipEndHandler);
	   }
	
	   private function bwToolTipShowHandler(e:ToolTipEvent):void {
	   // The ToolTip must be stored so it's text can be updated
	   _bandwidthToolTip = e.toolTip;
	   updateBwToolTip();
	   } */
	
	/*
	   private function updateBandwidthTimerHandler(e:TimerEvent):void {
	   _bandwidthConsumedDown = NetworkStatsData.getInstance().formattedCurrentConsumedDownBW;
	   _bandwidthConsumedUp = NetworkStatsData.getInstance().formattedCurrentConsumedUpBW;
	   updateBwToolTip();
	   }
	
	   private function updateBwToolTip():void {
	   if (_bandwidthToolTip) {
	   _bandwidthToolTip.text = ResourceUtil.getInstance().getString('bbb.bwmonitor.upload.short') + ": " + _bandwidthConsumedUp + " | " + ResourceUtil.getInstance().getString('bbb.bwmonitor.download.short') + ": " + _bandwidthConsumedDown;
	   }
	   }
	 */
	
	/*
	   private function addSettingsComponent(e:SettingsComponentEvent = null):void {
	   settingsComponents.push(e.component);
	   }
	
	   private function removeSettingsComponent(e:SettingsComponentEvent = null):void {
	   throw("Not implemented");
	   }
	   private function onSettingsButtonClick():void {
	   settingsPopup = BBBSettings(PopUpManager.createPopUp(this.parent, BBBSettings, true));
	   settingsPopup.pushComponents(settingsComponents);
	   }
	   private function refreshRole(e:ChangeMyRole):void {
	   refreshModeratorButtonsVisibility(null);
	   }
	 */
	
	}
}
