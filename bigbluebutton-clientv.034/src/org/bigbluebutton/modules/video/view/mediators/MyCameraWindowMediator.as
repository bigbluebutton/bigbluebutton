package org.bigbluebutton.modules.video.view.mediators
{
	import flash.events.Event;
	
	import org.bigbluebutton.modules.video.VideoFacade;
	import org.bigbluebutton.modules.video.control.notifiers.PublishNotifier;
	import org.bigbluebutton.modules.video.view.MyCameraWindow;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	public class MyCameraWindowMediator extends Mediator
	{
		public static const NAME:String = "MyCameraWindowMediator";
		public static const RECORD_STREAM:String = "Record Stream";
		public static const START_STOP_DEVICES:String = "Start or Stop devices";
		public static const CLOSE:String = "Close MyCamera Window";
		public static const CLOSE_CLICKED:String = "Close Clicked";
		public static const OPEN_SETTINGS:String = "Open Settings";
		
		public function MyCameraWindowMediator(view:MyCameraWindow)
		{
			super(NAME, view);
			view.addEventListener(RECORD_STREAM, recordStream);
			view.addEventListener(START_STOP_DEVICES, startOrStopDevices);
			view.addEventListener(CLOSE, closeCameraWindow);
			view.addEventListener(CLOSE_CLICKED, closeClicked);
			view.addEventListener(OPEN_SETTINGS, openSettings);
		}
		
		override public function listNotificationInterests():Array{
			return [
					VideoFacade.CLOSE_ALL,
					VideoFacade.ENABLE_CAMERA
					];
		}
		
		override public function handleNotification(notification:INotification):void{
			switch(notification.getName()){
				case VideoFacade.CLOSE_ALL:
					cameraWindow.close();
					break;
				case VideoFacade.ENABLE_CAMERA:
					startOrStopDevices(new Event(VideoFacade.ENABLE_CAMERA));
					break;
			}
		}
		
		public function get cameraWindow():MyCameraWindow{
			return viewComponent as MyCameraWindow;
		}
		
		private function recordStream(e:Event):void{
			if ( ! cameraWindow.media.broadcasting ) 
			{
				sendNotification(VideoFacade.PUBLISH_STREAM_COMMAND, new PublishNotifier("live", cameraWindow.media.streamName));
			} 
			else
			{
				sendNotification(VideoFacade.UNPUBLISH_STREAM_COMMAND, cameraWindow.media.streamName);
			}
		}
		
		private function startOrStopDevices(e:Event) : void	
		{
			if (cameraWindow.media.deviceStarted) {
				stopDevices();
			} else {
				startDevices();
			}
		}
		
		private function stopDevices() : void
		{
			sendNotification(VideoFacade.STOP_MICROPHONE_COMMAND, cameraWindow.media.streamName);
			sendNotification(VideoFacade.STOP_CAMERA_COMMAND, cameraWindow.media.streamName);
		}  	
		
		private function startDevices() : void
		{
			if (cameraWindow.media.video.settings.cameraIndex > 0)
				sendNotification(VideoFacade.START_CAMERA_COMMAND, cameraWindow.media.streamName);
			if (cameraWindow.media.audio.settings.micIndex > 0)	
				sendNotification(VideoFacade.START_MICROPHONE_COMMAND, cameraWindow.media.streamName);
		}
		
		private function closeCameraWindow(e:Event):void{
			sendNotification(VideoFacade.CLOSE_RECORDING);
		}
		
		private function closeClicked(e:Event):void{
			sendNotification(VideoFacade.STOP_MICROPHONE_COMMAND, cameraWindow.media.streamName);
			sendNotification(VideoFacade.STOP_CAMERA_COMMAND, cameraWindow.media.streamName);
			
			if (cameraWindow.media.broadcasting) {
				sendNotification(VideoFacade.UNPUBLISH_STREAM_COMMAND, cameraWindow.media.streamName);
			}				
		}
		
		private function openSettings(e:Event):void{
			facade.registerMediator(new SettingsWindowMediator(cameraWindow.settingsWindow));
		}

	}
}