package org.bigbluebutton.air.video {
	
	import org.bigbluebutton.air.video.commands.ShareCameraCommand;
	import org.bigbluebutton.air.video.commands.ShareCameraSignal;
	import org.bigbluebutton.air.video.views.WebcamDock;
	import org.bigbluebutton.air.video.views.WebcamDockMediator;
	
	import robotlegs.bender.extensions.mediatorMap.api.IMediatorMap;
	import robotlegs.bender.extensions.signalCommandMap.api.ISignalCommandMap;
	import robotlegs.bender.framework.api.IConfig;
	
	public class VideoConfig implements IConfig {
		
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
			mediatorMap.map(WebcamDock).toMediator(WebcamDockMediator);
		}
		
		private function signals():void {
			signalCommandMap.map(ShareCameraSignal).toCommand(ShareCameraCommand);
		}
	}
}
