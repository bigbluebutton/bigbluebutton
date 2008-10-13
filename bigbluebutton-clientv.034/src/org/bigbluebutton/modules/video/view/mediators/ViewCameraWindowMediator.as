package org.bigbluebutton.modules.video.view.mediators
{
	import flash.events.Event;
	
	import mx.controls.Alert;
	
	import org.bigbluebutton.modules.video.VideoFacade;
	import org.bigbluebutton.modules.video.control.notifiers.PlayStreamNotifier;
	import org.bigbluebutton.modules.video.model.vo.PlaybackState;
	import org.bigbluebutton.modules.video.view.ViewCameraWindow;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	public class ViewCameraWindowMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "ViewCameraWindowMediator";
		public static const VIEW_STREAM:String = "ViewStreamDispatch";
		public static const STOP_STREAM:String = "StopStreamDispatch";
		
		public function ViewCameraWindowMediator(view:ViewCameraWindow)
		{
			super(NAME, view);
			view.addEventListener(VIEW_STREAM, viewStream);
			view.addEventListener(STOP_STREAM, stopStream);
		}
		
		override public function listNotificationInterests():Array{ 
			return [
					VideoFacade.CLOSE_ALL
					];
		}
		
		override public function handleNotification(notification:INotification):void{
			switch(notification.getName()){
				case VideoFacade.CLOSE_ALL:
					videoWindow.close();
					break;
			}
		}
		
		public function get videoWindow():ViewCameraWindow{
			return viewComponent as ViewCameraWindow;
		}
		
		private function viewStream(e:Event):void{
		//Alert.show(videoWindow.media.playState.name);
		if ( videoWindow.media.playState == PlaybackState.PLAYING ) 
			{
				//mainApp.publisherApp.pauseStream(media.streamName);		
				sendNotification(VideoFacade.PAUSE_STREAM_COMMAND, videoWindow.media.streamName);	
			} 
			else if ( videoWindow.media.playState == PlaybackState.STOPPED )
			{
				// Start playback from beginning.
				//mainApp.publisherApp.playStream(media.streamName, true /*enableVideoCb.selected*/, false /*enableAudioCb.selected*/ );
				sendNotification(VideoFacade.PLAY_STREAM_COMMAND, new PlayStreamNotifier(videoWindow.media.streamName,true, false));
			} 
			else if ( videoWindow.media.playState == PlaybackState.PAUSED )
			{
				// Resume playback.
				//mainApp.publisherApp.resumeStream(media.streamName); 
				sendNotification(VideoFacade.RESUME_STREAM_COMMAND, videoWindow.media.streamName);
			}
		}
		
		private function stopStream(e:Event):void{
			//mainApp.publisherApp.stopStream(media.streamName);
			sendNotification(VideoFacade.STOP_STREAM_COMMAND, videoWindow.media.streamName);
		}

	}
}