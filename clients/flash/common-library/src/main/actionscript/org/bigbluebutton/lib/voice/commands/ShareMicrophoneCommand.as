package org.bigbluebutton.lib.voice.commands {
	
	import org.bigbluebutton.lib.common.models.ISaveData;
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
		public var saveData:ISaveData;
		
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
			voiceConnection.hangUpSuccessSignal.remove(enableAudio);
			if (!voiceConnection.connection.connected) {
				voiceConnection.connectionSuccessSignal.add(mediaconnectionSuccess);
				voiceConnection.connectionFailureSignal.add(mediaConnectionFailure);
				voiceConnection.connect(conferenceParameters, _listenOnly);
			} else if (!voiceConnection.callActive) {
				voiceConnection.connectionSuccessSignal.add(mediaconnectionSuccess);
				voiceConnection.connectionFailureSignal.add(mediaConnectionFailure);
				voiceConnection.call(_listenOnly);
			} else {
				disableAudio();
				voiceConnection.hangUpSuccessSignal.add(enableAudio);
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
		
		private function mediaconnectionSuccess(publishName:String, playName:String, codec:String, manager:VoiceStreamManager = null):void {
			trace(LOG + "mediaconnectionSuccessSignal()");
			if (!manager) {
				var manager:VoiceStreamManager = new VoiceStreamManager();
				var savedGain:Number = Number(saveData.read("micGain"));
				if (savedGain) {
					manager.setDefaultMicGain(savedGain);
				}
			}
			manager.play(voiceConnection.connection, playName);
			if (publishName != null && publishName.length != 0) {
				manager.publish(voiceConnection.connection, publishName, codec, userSession.pushToTalk);
			}
			userSession.voiceStreamManager = manager;
			voiceConnection.connectionSuccessSignal.remove(mediaconnectionSuccess);
			voiceConnection.connectionFailureSignal.remove(mediaConnectionFailure);
			if (userSession.pushToTalk) {
				userSession.pushToTalkSignal.dispatch();
			}
		}
		
		private function mediaConnectionFailure(reason:String):void {
			trace(LOG + "mediaUnconnectionSuccessSignal()");
			voiceConnection.connectionSuccessSignal.remove(mediaconnectionSuccess);
			voiceConnection.connectionFailureSignal.remove(mediaConnectionFailure);
		}
	}
}
