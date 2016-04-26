package org.bigbluebutton.web.toolbar.micbutton.audioselectionwindow {
	
	import flash.events.Event;
	import flash.events.KeyboardEvent;
	import flash.events.MouseEvent;
	import flash.media.Camera;
	import flash.system.Security;
	import flash.system.SecurityPanel;
	import flash.ui.Keyboard;
	
	import mx.collections.ArrayCollection;
	import mx.collections.ArrayList;
	import mx.events.CloseEvent;
	import mx.events.ListEvent;
	import mx.managers.PopUpManager;
	import mx.utils.ObjectUtil;
	
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.models.User;
	import org.bigbluebutton.lib.user.models.UserList;
	import org.bigbluebutton.lib.user.services.IUsersService;
	import org.bigbluebutton.lib.video.models.VideoProfile;
	import org.bigbluebutton.lib.voice.commands.ShareMicrophoneSignal;
	import org.bigbluebutton.web.toolbar.micbutton.commands.AudioSelectionWindowClosedSignal;
	import org.bigbluebutton.web.toolbar.webcambutton.commands.CamSettingsClosedSignal;
	import org.bigbluebutton.web.toolbar.webcambutton.commands.ShareCameraSignal;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	import spark.components.Group;
	
	public class AudioSelectionWindowMediator extends Mediator {
		
		[Inject]
		public var view:AudioSelectionWindow;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var usersService:IUsersService;
		
		[Inject]
		public var params:IConferenceParameters;
		
		[Inject]
		public var shareMicrophoneSignal:ShareMicrophoneSignal;
		
		[Inject]
		public var audioSelectionWindowClosedSignal:AudioSelectionWindowClosedSignal;
		
		//private var phoneOptions:PhoneOptions = new PhoneOptions;
		
		private var baseIndex:int = 1;
		
		override public function initialize():void {
			
			initTabIndexes();
			
			if (!userSession.phoneOptions.listenOnlyMode)
				view.btnListenOnly.enabled = false;
			if ((userSession.phoneOptions.presenterShareOnly && !userSession.userList.me.presenter && !userSession.userList.me.isModerator())) {
				view.btnMicrophone.enabled = false;
			}
			
			if (userSession.phoneOptions.showPhoneOption) {
				//view.txtPhone.text = ResourceUtil.getInstance().getString('bbb.audioSelection.txtPhone.text', [conference.dialNumber, conference.voiceBridge]);
			} else {
				view.vrulePhone.visible = view.vrulePhone.includeInLayout = false;
				view.vboxPhone.visible = view.vboxPhone.includeInLayout = false;
				view..width = 450;
				view..height = 325;
				view.vboxMic.percentWidth = 50;
				view.vboxListen.percentWidth = 50;
			}
			
			view.btnMicrophone.addEventListener(MouseEvent.CLICK, onMicClick);
			view.btnListenOnly.addEventListener(MouseEvent.CLICK, onListenClick);
			view.cancelBtn.addEventListener(MouseEvent.CLICK, onCancelClicked);
		}
		
		
		private function initTabIndexes():void {
			view.joinAudioTextArea.tabIndex = baseIndex;
			view.btnMicrophone.tabIndex = baseIndex + 1;
			view.btnListenOnly.tabIndex = baseIndex + 2;
			view.cancelBtn.tabIndex = baseIndex + 3;
		}
		
		
		private function onMicClick(e:MouseEvent):void {
			trace("AudioSelectionWindow - Share Microphone Clicked");
			var audioOptions:Object = new Object();
			audioOptions.shareMic = true;
			audioOptions.listenOnly = false;
			shareMicrophoneSignal.dispatch(audioOptions);
			PopUpManager.removePopUp(view);
		}
		
		private function onListenClick(e:MouseEvent):void {
			trace("AudioSelectionWindow - ListenOnly Clicked");
			var audioOptions:Object = new Object();
			audioOptions.listenOnly = !userSession.userList.me.listenOnly;
			userSession.userList.me.listenOnly = !userSession.userList.me.listenOnly
			audioOptions.shareMic = userSession.userList.me.voiceJoined = false;
			shareMicrophoneSignal.dispatch(audioOptions);
			PopUpManager.removePopUp(view);
		}
		
		private function onCancelClicked(e:MouseEvent):void {
			trace("AudioSelectionWindow - Cancel clicked");
			audioSelectionWindowClosedSignal.dispatch();
			PopUpManager.removePopUp(view);
		}
		
		private function handleBecomePresenter():void {
			if (userSession.phoneOptions.presenterShareOnly)
				view.btnMicrophone.enabled = true;
		}
		
		private function handleBecomeViewer():void {
			if (userSession.phoneOptions.presenterShareOnly && !userSession.userList.me.isModerator())
				view.btnMicrophone.enabled = false;
		}
		
		override public function destroy():void {
			super.destroy();
			view = null;
		}
	}
}

