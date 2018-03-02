package org.bigbluebutton.air.voice {
	
	import org.bigbluebutton.air.voice.views.EchoTestViewMediatorAIR;
	import org.bigbluebutton.air.voice.views.JoinAudioView;
	import org.bigbluebutton.air.voice.views.JoinAudioViewMediator;
	import org.bigbluebutton.lib.voice.commands.MicrophoneMuteCommand;
	import org.bigbluebutton.lib.voice.commands.MicrophoneMuteSignal;
	import org.bigbluebutton.lib.voice.commands.ShareMicrophoneCommand;
	import org.bigbluebutton.lib.voice.commands.ShareMicrophoneSignal;
	import org.bigbluebutton.lib.voice.views.EchoTestViewBase;
	
	import robotlegs.bender.extensions.matching.TypeMatcher;
	import robotlegs.bender.extensions.mediatorMap.api.IMediatorMap;
	import robotlegs.bender.extensions.signalCommandMap.api.ISignalCommandMap;
	import robotlegs.bender.framework.api.IConfig;
	
	public class VoiceConfig implements IConfig {
		
		[Inject]
		public var mediatorMap:IMediatorMap;
		
		[Inject]
		public var signalCommandMap:ISignalCommandMap;
		
		public function configure():void {
			mediators();
			signals();
		}
		
		/**
		 * Maps view mediators to views.
		 */
		private function mediators():void {
			//mediatorMap.map(IMicButton).toMediator(MicButtonMediator);
			mediatorMap.mapMatcher(new TypeMatcher().allOf(JoinAudioView)).toMediator(JoinAudioViewMediator);
			mediatorMap.mapMatcher(new TypeMatcher().allOf(EchoTestViewBase)).toMediator(EchoTestViewMediatorAIR);
		}
		
		/**
		 * Maps signals to commands using the signalCommandMap.
		 */
		private function signals():void {
			signalCommandMap.map(ShareMicrophoneSignal).toCommand(ShareMicrophoneCommand);
			signalCommandMap.map(MicrophoneMuteSignal).toCommand(MicrophoneMuteCommand);
		}
	}
}
