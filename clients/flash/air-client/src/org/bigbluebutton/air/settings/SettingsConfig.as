package org.bigbluebutton.air.settings {
	
	import org.bigbluebutton.air.settings.views.audio.AudioSettingsViewMediator;
	import org.bigbluebutton.air.settings.views.audio.IAudioSettingsView;
	import org.bigbluebutton.air.settings.views.camera.CameraSettingsViewMediator;
	import org.bigbluebutton.air.settings.views.camera.ICameraSettingsView;
	import org.bigbluebutton.air.settings.views.lock.ILockSettingsView;
	import org.bigbluebutton.air.settings.views.lock.LockSettingsViewMediator;
	
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
		}
		
		
		/**
		 * Maps view mediators to views.
		 */
		private function mediators():void {
			mediatorMap.map(IAudioSettingsView).toMediator(AudioSettingsViewMediator);
			mediatorMap.map(ICameraSettingsView).toMediator(CameraSettingsViewMediator);
			mediatorMap.map(ILockSettingsView).toMediator(LockSettingsViewMediator);
		}
	
	}
}
