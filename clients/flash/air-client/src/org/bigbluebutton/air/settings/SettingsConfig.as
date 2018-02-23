package org.bigbluebutton.air.settings {
	
	import org.bigbluebutton.air.settings.views.SettingsViewMediatorAIR;
	import org.bigbluebutton.air.settings.views.audio.AudioSettingsViewBaseAIR;
	import org.bigbluebutton.air.settings.views.audio.AudioSettingsViewMediatorAIR;
	import org.bigbluebutton.air.settings.views.camera.CameraSettingsViewBaseAIR;
	import org.bigbluebutton.air.settings.views.camera.CameraSettingsViewMediatorAIR;
	import org.bigbluebutton.air.settings.views.chat.ChatSettingsViewBaseAIR;
	import org.bigbluebutton.air.settings.views.lock.LockSettingsViewBaseAIR;
	import org.bigbluebutton.air.settings.views.lock.LockSettingsViewMediatorAIR;
	import org.bigbluebutton.lib.main.commands.SaveLockSettingsCommand;
	import org.bigbluebutton.lib.main.commands.SaveLockSettingsSignal;
	import org.bigbluebutton.lib.settings.views.SettingsViewBase;
	import org.bigbluebutton.lib.settings.views.audio.AudioSettingsViewBase;
	import org.bigbluebutton.lib.settings.views.camera.CameraSettingsViewBase;
	import org.bigbluebutton.lib.settings.views.chat.ChatSettingsViewBase;
	import org.bigbluebutton.lib.settings.views.chat.ChatSettingsViewMediatorBase;
	import org.bigbluebutton.lib.settings.views.lock.LockSettingsViewBase;
	import org.bigbluebutton.lib.video.commands.CameraQualityCommand;
	import org.bigbluebutton.lib.video.commands.CameraQualitySignal;
	
	import robotlegs.bender.extensions.matching.TypeMatcher;
	import robotlegs.bender.extensions.mediatorMap.api.IMediatorMap;
	import robotlegs.bender.extensions.signalCommandMap.api.ISignalCommandMap;
	import robotlegs.bender.framework.api.IConfig;
	
	public class SettingsConfig implements IConfig {
		
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
			mediatorMap.map(SettingsViewBase).toMediator(SettingsViewMediatorAIR);
			mediatorMap.mapMatcher(new TypeMatcher().allOf(AudioSettingsViewBase, AudioSettingsViewBaseAIR)).toMediator(AudioSettingsViewMediatorAIR);
			mediatorMap.mapMatcher(new TypeMatcher().allOf(CameraSettingsViewBase, CameraSettingsViewBaseAIR)).toMediator(CameraSettingsViewMediatorAIR);
			mediatorMap.mapMatcher(new TypeMatcher().allOf(ChatSettingsViewBase, ChatSettingsViewBaseAIR)).toMediator(ChatSettingsViewMediatorBase);
			mediatorMap.mapMatcher(new TypeMatcher().allOf(LockSettingsViewBase, LockSettingsViewBaseAIR)).toMediator(LockSettingsViewMediatorAIR);
		}
		
		/**
		 * Maps signals to commands using the signalCommandMap.
		 */
		private function signals():void {
			signalCommandMap.map(SaveLockSettingsSignal).toCommand(SaveLockSettingsCommand);
			signalCommandMap.map(CameraQualitySignal).toCommand(CameraQualityCommand);
		}
	}
}
