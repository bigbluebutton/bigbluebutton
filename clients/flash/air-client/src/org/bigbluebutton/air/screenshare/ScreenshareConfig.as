package org.bigbluebutton.air.screenshare
{
	import robotlegs.bender.extensions.mediatorMap.api.IMediatorMap;
	import robotlegs.bender.extensions.signalCommandMap.api.ISignalCommandMap;
	import robotlegs.bender.framework.api.IConfig;

	public class ScreenshareConfig implements IConfig
	{
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
			//mediatorMap.map(IVideoButton).toMediator(VideoButtonMediator);
			//mediatorMap.map(IVideoChatView).toMediator(VideoChatViewMediator);
			//mediatorMap.map(ISwapCameraButton).toMediator(SwapCameraMediator);
		}
		
		private function signals():void {
			
		}
	}
}