package org.bigbluebutton.modules.video.view
{
	import flash.events.Event;
	
	import org.bigbluebutton.modules.video.VideoModuleConstants;
	import org.bigbluebutton.modules.video.model.MediaProxy;
	import org.bigbluebutton.modules.video.model.vo.PlayMedia;
	import org.bigbluebutton.modules.video.view.components.ViewCameraWindow;
	import org.bigbluebutton.modules.video.view.events.CloseViewCameraWindowEvent;
	import org.bigbluebutton.modules.video.view.events.StartPlayStreamEvent;
	import org.bigbluebutton.modules.video.view.events.StopPlayStreamEvent;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	public class ViewCameraWindowMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "ViewCameraWindowMediator";

		private var _viewCamWindow:ViewCameraWindow;
		private var _stream:String;
		
		public function ViewCameraWindowMediator(name:String, streamName:String)
		{
			super(name);
			_stream = streamName;
			_viewCamWindow = new ViewCameraWindow();
			_viewCamWindow.streamName = _stream;
			_viewCamWindow.addEventListener(CloseViewCameraWindowEvent.CLOSE_VIEW_CAMERA_WINDOW_EVENT, onCloseViewCameraWindowEvent);
			_viewCamWindow.addEventListener(StartPlayStreamEvent.START_PLAY_STREAM_EVENT, onStartPlayStreamEvent);
			_viewCamWindow.addEventListener(StopPlayStreamEvent.STOP_PLAY_STREAM_EVENT, onStopPlayStreamEvent);
		}
		
		private function onStartPlayStreamEvent(e:StartPlayStreamEvent):void {
			_viewCamWindow.media = proxy.getPlayMedia(e.streamName) as PlayMedia;
		}
		
		private function onStopPlayStreamEvent(e:StopPlayStreamEvent):void {
			
		}
		
		override public function listNotificationInterests():Array{ 
			return [
					VideoModuleConstants.PLAY_STREAM,
					VideoModuleConstants.STOP_STREAM
					];
		}
		
		override public function handleNotification(notification:INotification):void{
			switch(notification.getName()){
				case VideoModuleConstants.CLOSE_ALL:
//					videoWindow.close();
					break;
			}
		}
		
		private function onCloseViewCameraWindowEvent(e:CloseViewCameraWindowEvent):void{
/*		
		if ( videoWindow.media.playState == PlaybackState.PLAYING ) 
			{
				//mainApp.publisherApp.pauseStream(media.streamName);		
				sendNotification(VideoModuleConstants.PAUSE_STREAM_COMMAND, videoWindow.media.streamName);	
			} 
			else if ( videoWindow.media.playState == PlaybackState.STOPPED )
			{
				sendNotification(VideoModuleConstants.PLAY_STREAM_COMMAND, new PlayStreamNotifier(videoWindow.media.streamName,true, false));
			} 
			else if ( videoWindow.media.playState == PlaybackState.PAUSED )
			{
				sendNotification(VideoModuleConstants.RESUME_STREAM_COMMAND, videoWindow.media.streamName);
			}
*/
		}
		
		private function stopStream(e:Event):void{
			//mainApp.publisherApp.stopStream(media.streamName);
//			sendNotification(VideoModuleConstants.STOP_STREAM_COMMAND, videoWindow.media.streamName);
		}

		private function get proxy():MediaProxy {
			return facade.retrieveProxy(MediaProxy.NAME) as MediaProxy;
		}
	}
}