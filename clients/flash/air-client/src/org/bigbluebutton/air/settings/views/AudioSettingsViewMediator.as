package org.bigbluebutton.air.settings.views {
	
	import flash.events.MouseEvent;
	
	import mx.core.FlexGlobals;
	import mx.resources.ResourceManager;
	
	import org.bigbluebutton.air.main.models.IUserUISession;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.models.User;
	import org.bigbluebutton.lib.user.models.UserList;
	import org.bigbluebutton.lib.voice.commands.ShareMicrophoneSignal;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class AudioSettingsViewMediator extends Mediator {
		
		[Inject]
		public var view:IAudioSettingsView;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var userUISession:IUserUISession;

		[Inject]
		public var shareMicrophoneSignal:ShareMicrophoneSignal;
		
		private var autoJoined:Boolean;

		private var lockedMic:Boolean;

		override public function initialize():void {
			userSession.userList.userChangeSignal.add(userChangeHandler);
			FlexGlobals.topLevelApplication.pageName.text = ResourceManager.getInstance().getString('resources', 'audioSettings.title');
			var userMe:User = userSession.userList.me;
			view.shareMicButton.addEventListener(MouseEvent.CLICK, onShareMicClick);
			view.listenOnlyButton.addEventListener(MouseEvent.CLICK, onListenOnlyClick);
			userSession.lockSettings.disableMicSignal.add(disableMic);
			disableMic(userSession.lockSettings.disableMic && userMe.role != User.MODERATOR && !userMe.presenter);
			view.listenOnlyButton.visible = !userMe.voiceJoined;
			view.shareMicButton.label = ResourceManager.getInstance().getString('resources', userMe.voiceJoined ? 'audioSettings.shareMicrophone.off' : 'audioSettings.shareMicrophone.on');
			view.listenOnlyButton.label = ResourceManager.getInstance().getString('resources', userMe.listenOnly ? 'audioSettings.listenOnly.off' : 'audioSettings.listenOnly.on');
			FlexGlobals.topLevelApplication.backBtn.visible = true;
			FlexGlobals.topLevelApplication.profileBtn.visible = false;
		}
		
		private function disableMic(disable:Boolean):void {
			if (disable) {
				lockedMic = true;
				view.shareMicButton.visible = false;
			} else {
				lockedMic = false;
				view.shareMicButton.visible = !userSession.userList.me.listenOnly;
			}
		}

		private function onShareMicClick(event:MouseEvent):void {
			var audioOptions:Object = new Object();
			audioOptions.shareMic = userSession.userList.me.voiceJoined = !userSession.userList.me.voiceJoined;
			audioOptions.listenOnly = userSession.userList.me.listenOnly = false;
			shareMicrophoneSignal.dispatch(audioOptions);
			if (userSession.phoneAutoJoin && !userSession.phoneSkipCheck) {
				userSession.phoneAutoJoin = false;
				userUISession.popPage();
			}
		}
		
		private function onListenOnlyClick(event:MouseEvent):void {
			var audioOptions:Object = new Object();
			audioOptions.listenOnly = !userSession.userList.me.listenOnly;
			userSession.userList.me.listenOnly = !userSession.userList.me.listenOnly
			audioOptions.shareMic = userSession.userList.me.voiceJoined = false;
			shareMicrophoneSignal.dispatch(audioOptions);
			if (userSession.phoneAutoJoin && !userSession.phoneSkipCheck) {
				userSession.phoneAutoJoin = false;
				userUISession.popPage();
			}
		}
		
		private function userChangeHandler(user:User, type:int):void {
			if (user.me && type == UserList.JOIN_AUDIO) {
				view.shareMicButton.label = ResourceManager.getInstance().getString('resources', user.voiceJoined ? 'audioSettings.shareMicrophone.off' : 'audioSettings.shareMicrophone.on');
			} else if (user.me && type == UserList.LISTEN_ONLY) {
				view.listenOnlyButton.label = ResourceManager.getInstance().getString('resources', user.listenOnly ? 'audioSettings.listenOnly.off' : 'audioSettings.listenOnly.on');
			}
			view.shareMicButton.visible = !userSession.userList.me.listenOnly && !lockedMic;
			view.listenOnlyButton.visible = !userSession.userList.me.voiceJoined;
		}
		
		override public function destroy():void {
			super.destroy();
			userSession.lockSettings.disableMicSignal.remove(disableMic);
			view.shareMicButton.removeEventListener(MouseEvent.CLICK, onShareMicClick);
			view.listenOnlyButton.removeEventListener(MouseEvent.CLICK, onListenOnlyClick);
			userSession.phoneAutoJoin = false;
		}
	}
}