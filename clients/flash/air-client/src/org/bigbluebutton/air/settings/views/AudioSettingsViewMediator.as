package org.bigbluebutton.air.settings.views {
	
	import flash.events.MouseEvent;
	
	import mx.core.FlexGlobals;
	import mx.resources.ResourceManager;
	
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
		public var shareMicrophoneSignal:ShareMicrophoneSignal;
		
		override public function initialize():void {
			userSession.userList.userChangeSignal.add(userChangeHandler);
			FlexGlobals.topLevelApplication.pageName.text = ResourceManager.getInstance().getString('resources', 'audioSettings.title');
			var userMe:User = userSession.userList.me;
			view.shareMicButton.addEventListener(MouseEvent.CLICK, onShareMicClick);
			view.listenOnlyButton.addEventListener(MouseEvent.CLICK, onListenOnlyClick);
			view.listenOnlyButton.visible = !userMe.voiceJoined;
			view.shareMicButton.visible = !userMe.listenOnly;
			view.shareMicButton.label = ResourceManager.getInstance().getString('resources', userMe.voiceJoined ? 'audioSettings.shareMicrophone.off' : 'audioSettings.shareMicrophone.on');
			view.listenOnlyButton.label = ResourceManager.getInstance().getString('resources', userMe.listenOnly ? 'audioSettings.listenOnly.off' : 'audioSettings.listenOnly.on');
			FlexGlobals.topLevelApplication.backBtn.visible = true;
			FlexGlobals.topLevelApplication.profileBtn.visible = false;
		}
		
		private function onShareMicClick(event:MouseEvent):void {
			var audioOptions:Object = new Object();
			audioOptions.shareMic = userSession.userList.me.voiceJoined = !userSession.userList.me.voiceJoined;
			audioOptions.listenOnly = userSession.userList.me.listenOnly = false;
			shareMicrophoneSignal.dispatch(audioOptions);
		}
		
		private function onListenOnlyClick(event:MouseEvent):void {
			var audioOptions:Object = new Object();
			audioOptions.listenOnly = !userSession.userList.me.listenOnly;
			audioOptions.shareMic = userSession.userList.me.voiceJoined = false;
			shareMicrophoneSignal.dispatch(audioOptions);
		}
		
		private function userChangeHandler(user:User, type:int):void {
			if (user.me && type == UserList.JOIN_AUDIO) {
				view.shareMicButton.label = ResourceManager.getInstance().getString('resources', user.voiceJoined ? 'audioSettings.shareMicrophone.off' : 'audioSettings.shareMicrophone.on');
			} else if (user.me && type == UserList.LISTEN_ONLY) {
				view.listenOnlyButton.label = ResourceManager.getInstance().getString('resources', user.listenOnly ? 'audioSettings.listenOnly.off' : 'audioSettings.listenOnly.on');
			}
			view.shareMicButton.visible = !userSession.userList.me.listenOnly;
			view.listenOnlyButton.visible = !userSession.userList.me.voiceJoined;
		}
		
		override public function destroy():void {
			super.destroy();
			view.shareMicButton.removeEventListener(MouseEvent.CLICK, onShareMicClick);
			view.listenOnlyButton.removeEventListener(MouseEvent.CLICK, onListenOnlyClick);
		}
	}
}
