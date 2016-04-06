package org.bigbluebutton.air.video {
	
	import org.bigbluebutton.air.main.views.ui.videobutton.IVideoButton;
	import org.bigbluebutton.air.main.views.ui.videobutton.VideoButtonMediator;
	import org.bigbluebutton.air.video.commands.ShareCameraCommand;
	import org.bigbluebutton.air.video.views.swapcamera.ISwapCameraButton;
	import org.bigbluebutton.air.video.views.swapcamera.SwapCameraMediator;
	import org.bigbluebutton.air.video.views.videochat.IVideoChatView;
	import org.bigbluebutton.air.video.views.videochat.VideoChatViewMediator;
	import org.bigbluebutton.lib.video.commands.ShareCameraSignal;
	
	import robotlegs.bender.extensions.mediatorMap.api.IMediatorMap;
	import robotlegs.bender.extensions.signalCommandMap.api.ISignalCommandMap;
	import robotlegs.bender.framework.api.IConfig;
	import robotlegs.bender.framework.api.IInjector;
	
	public class VideoConfig implements IConfig {
		
		[Inject]
		public var injector:IInjector;
		
		[Inject]
		public var mediatorMap:IMediatorMap;
		
		[Inject]
		public var signalCommandMap:ISignalCommandMap;
		
		public function configure():void {
			dependencies();
			mediators();
			signals();
		}
		
		/**
		 * Specifies all the dependencies for the feature
		 * that will be injected onto objects used by the
		 * application.
		 */
		private function dependencies():void {
		}
		
		/**
		 * Maps view mediators to views.
		 */
		private function mediators():void {
			mediatorMap.map(IVideoButton).toMediator(VideoButtonMediator);
			mediatorMap.map(IVideoChatView).toMediator(VideoChatViewMediator);
			mediatorMap.map(ISwapCameraButton).toMediator(SwapCameraMediator);
			signalCommandMap.map(ShareCameraSignal).toCommand(ShareCameraCommand);
		}
		
		/**
		 * Maps signals to commands using the signalCommandMap.
		 */
		private function signals():void {
		}
	}
}
