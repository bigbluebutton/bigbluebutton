package org.bigbluebutton.lib.voice.commands {
	
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.voice.services.IVoiceConnection;
	import org.bigbluebutton.lib.voice.services.VoiceStreamManager;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class ShareMicrophoneCommand extends Command {
		private const LOG:String = "ShareMicrophoneCommand::";
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var conferenceParameters:IConferenceParameters;
		
		[Inject]
		public var audioOptions:Object;
		
		private var _shareMic:Boolean;
		
		private var _listenOnly:Boolean;
		
		private var voiceConnection:IVoiceConnection;
		
		override public function execute():void {
			getAudioOption(audioOptions);
			if (_shareMic || _listenOnly) {
				enableAudio();
			} else {
				disableAudio();
			}
		}
		
		private function getAudioOption(option:Object):void {
			if (option != null && option.hasOwnProperty("shareMic") && option.hasOwnProperty("listenOnly")) {
				_shareMic = option.shareMic;
				_listenOnly = option.listenOnly;
			}
		}
		
		private function enableAudio():void {
			voiceConnection = userSession.voiceConnection;
			if (!voiceConnection.connection.connected) {
				voiceConnection.connect(conferenceParameters);
				voiceConnection.connectionSuccessSignal.add(mediaConnectionSuccess);
				voiceConnection.connectionFailureSignal.add(mediaConnectionFailure);
			} else if (!voiceConnection.callActive) {
				voiceConnection.call(_listenOnly);
				voiceConnection.connectionSuccessSignal.add(mediaConnectionSuccess);
				voiceConnection.connectionFailureSignal.add(mediaConnectionFailure);
			}
		}
		
		private function disableAudio():void {
			var manager:VoiceStreamManager = userSession.voiceStreamManager;
			voiceConnection = userSession.voiceConnection;
			if (manager != null) {
				manager.close();
				voiceConnection.hangUp();
			}
		}
		
		private function mediaConnectionSuccess(publishName:String, playName:String, codec:String):void {
			trace(LOG + "mediaConnectionSuccess()");
			var manager:VoiceStreamManager = new VoiceStreamManager();
			manager.play(voiceConnection.connection, playName);
			if (publishName != null && publishName.length != 0) {
				manager.publish(voiceConnection.connection, publishName, codec);
			}
			userSession.voiceStreamManager = manager;
			voiceConnection.connectionSuccessSignal.remove(mediaConnectionSuccess);
			voiceConnection.connectionFailureSignal.remove(mediaConnectionFailure);
		}
		
		private function mediaConnectionFailure(reason:String):void {
			trace(LOG + "mediaConnectionFailure()");
			voiceConnection.connectionSuccessSignal.remove(mediaConnectionSuccess);
			voiceConnection.connectionFailureSignal.remove(mediaConnectionFailure);
		}
	}
}
