package org.bigbluebutton.lib.voice.commands {
	
	import org.bigbluebutton.lib.common.models.ISaveData;
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.voice.models.AudioTypeEnum;
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
		public var audioType:int;
		
		[Inject]
		public var dialStr:String;
		
		private var voiceConnection:IVoiceConnection;
		
		override public function execute():void {
			if (audioType == AudioTypeEnum.LEAVE) {
				disableAudio();
			} else {
				enableAudio();
			}
		}
		
		private function enableAudio():void {
			voiceConnection = userSession.voiceConnection;
			voiceConnection.hangUpSuccessSignal.remove(enableAudio);
			voiceConnection.connectionSuccessSignal.remove(enableAudio);
			
			if (!voiceConnection.connection.connected) {
				voiceConnection.connectionSuccessSignal.add(enableAudio);
				voiceConnection.connectionFailureSignal.add(connectionFailure);
				voiceConnection.connect(conferenceParameters);
			} else if (!voiceConnection.callActive) {
				voiceConnection.joinedVoiceConferenceSignal.add(joinVoiceConferenceSuccess);
				voiceConnection.connectionFailureSignal.add(connectionFailure);
				voiceConnection.call(audioType == AudioTypeEnum.LISTEN_ONLY, dialStr);
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
		
		private function joinVoiceConferenceSuccess(publishName:String, playName:String, codec:String, manager:VoiceStreamManager = null):void {
			trace(LOG + "mediaConnectionSuccessSignal()");
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
			voiceConnection.joinedVoiceConferenceSignal.remove(joinVoiceConferenceSuccess);
			voiceConnection.connectionFailureSignal.remove(connectionFailure);
			if (userSession.pushToTalk) {
				userSession.pushToTalkSignal.dispatch();
			}
		}
		
		private function connectionFailure(reason:String):void {
			trace(LOG + "connectionFailureSignal()");
			voiceConnection.joinedVoiceConferenceSignal.remove(joinVoiceConferenceSuccess);
			voiceConnection.connectionFailureSignal.remove(connectionFailure);
		}
	}
}
