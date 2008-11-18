package org.bigbluebutton.modules.video.view
{
	import flash.events.Event;
	
	import org.bigbluebutton.modules.video.VideoModuleConstants;
	import org.bigbluebutton.modules.video.model.MediaProxy;
	import org.bigbluebutton.modules.video.model.vo.BroadcastMedia;
	import org.bigbluebutton.modules.video.view.components.MyCameraWindow;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	public class MyCameraWindowMediator extends Mediator
	{		
		public static const NAME:String = "MyCameraWindowMediator";
		
		private var streamName:String;
			
		public function MyCameraWindowMediator(view:MyCameraWindow)
		{
			super(NAME, view);
			view.addEventListener(MyCameraWindow.BROADCAST_STREAM, broadcastStream);
			view.addEventListener(MyCameraWindow.STOP_BROADCAST_STREAM, stopBroadcastStream);
			view.addEventListener(MyCameraWindow.START_DEVICES, startDevices);
			view.addEventListener(MyCameraWindow.STOP_DEVICES, stopDevices);
			view.addEventListener(MyCameraWindow.CLOSE, closeCameraWindow);
			view.addEventListener(MyCameraWindow.CLOSE_CLICKED, closeClicked);
			view.addEventListener(MyCameraWindow.OPEN_SETTINGS, openSettings);
			streamName = "stream" + String( Math.floor( new Date().getTime() ) );
		}
		
		override public function listNotificationInterests():Array{
			return [
					VideoModuleConstants.CLOSE_ALL,
					VideoModuleConstants.ENABLE_CAMERA
					];
		}
		
		override public function handleNotification(notification:INotification):void{
			switch(notification.getName()){
				case VideoModuleConstants.CLOSE_ALL:
					cameraWindow.close();
					break;
				case VideoModuleConstants.ENABLE_CAMERA:
					//startOrStopDevices(new Event(VideoModuleConstants.ENABLE_CAMERA));
					break;
			}
		}
		
		public function get cameraWindow():MyCameraWindow{
			return viewComponent as MyCameraWindow;
		}
		
		private function broadcastStream(e:Event):void {
			trace('BroadcastStreamEvent');
			sendNotification(VideoModuleConstants.CREATE_BROADCAST_STREAM, streamName);
			sendNotification(VideoModuleConstants.SETUP_STREAM, streamName);
			sendNotification(VideoModuleConstants.START_CAMERA_COMMAND, streamName);
			sendNotification(VideoModuleConstants.PUBLISH_STREAM_COMMAND, {mode:"live", stream:streamName});
			
			var p:MediaProxy = facade.retrieveProxy(MediaProxy.NAME) as MediaProxy;
			var m:BroadcastMedia = p.getBroadcastMedia(streamName) as BroadcastMedia;
			cameraWindow.localVideo.video = m.video.localVideo; 
		}
		
		private function stopBroadcastStream(e:Event):void {
			sendNotification(VideoModuleConstants.UNPUBLISH_STREAM_COMMAND, streamName);			
		}
		
		private function stopDevices(e:Event):void
		{
			//sendNotification(VideoModuleConstants.STOP_MICROPHONE_COMMAND, streamName);
			sendNotification(VideoModuleConstants.STOP_CAMERA_COMMAND, streamName);
		}  	
		
		private function startDevices(e:Event):void
		{
			sendNotification(VideoModuleConstants.START_CAMERA_COMMAND, streamName);
			//sendNotification(VideoModuleConstants.START_MICROPHONE_COMMAND, streamName);
		}
		
		private function closeCameraWindow(e:Event):void{
			sendNotification(VideoModuleConstants.CLOSE_RECORDING);
		}
		
		private function closeClicked(e:Event):void{
			//sendNotification(VideoModuleConstants.STOP_MICROPHONE_COMMAND, streamName);
			sendNotification(VideoModuleConstants.STOP_CAMERA_COMMAND, streamName);
			
			if (cameraWindow.media.broadcasting) {
				sendNotification(VideoModuleConstants.UNPUBLISH_STREAM_COMMAND, streamName);
			}				
		}
		
		private function openSettings(e:Event):void{
//			facade.registerMediator(new SettingsWindowMediator(cameraWindow.settingsWindow));
		}

	}
}