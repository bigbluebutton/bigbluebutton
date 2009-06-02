package org.bigbluebutton.modules.video.view
{
	import flash.events.Event;
	
	import org.bigbluebutton.modules.video.VideoModuleConstants;
	import org.bigbluebutton.modules.video.model.MediaProxy;
	import org.bigbluebutton.modules.video.model.business.MediaType;
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
			streamName = "stream" + String( Math.floor( new Date().getTime() ) );
		}
		
		override public function listNotificationInterests():Array{
			return [
					VideoModuleConstants.STOP_ALL_BROADCAST_STREAM
					];
		}
		
		override public function handleNotification(notification:INotification):void{
			switch(notification.getName()){
				case VideoModuleConstants.STOP_ALL_BROADCAST_STREAM:
					LogUtil.debug('GOT STOP_ALL_BROADCAST_STREAM FOR MYCAMMEDIATOR');
					stopStream();
					cameraWindow.close();
					break;
			}
		}
		
		public function get cameraWindow():MyCameraWindow{
			return viewComponent as MyCameraWindow;
		}
		
		private function broadcastStream(e:Event):void {
			LogUtil.debug('BroadcastStreamEvent');
			sendNotification(VideoModuleConstants.CREATE_BROADCAST_STREAM, streamName);
			sendNotification(VideoModuleConstants.SETUP_STREAM, streamName);
			sendNotification(VideoModuleConstants.START_CAMERA_COMMAND, streamName);
			sendNotification(VideoModuleConstants.PUBLISH_STREAM_COMMAND, {mode:"live", stream:streamName});
			
			var p:MediaProxy = facade.retrieveProxy(MediaProxy.NAME) as MediaProxy;
			var m:BroadcastMedia = p.getBroadcastMedia(streamName) as BroadcastMedia;
			cameraWindow.localVideo.video = m.video.localVideo; 
			sendNotification(VideoModuleConstants.STARTED_BROADCAST, streamName);
		}
		
		private function stopBroadcastStream(e:Event):void {
			LogUtil.debug('StopBroadcastStreamEvent');
			stopStream();
		}
		
		private function stopStream():void {
			sendNotification(VideoModuleConstants.UNPUBLISH_STREAM_COMMAND, streamName);
			sendNotification(VideoModuleConstants.STOP_CAMERA_COMMAND, streamName);	
			sendNotification(VideoModuleConstants.REMOVE_STREAM_COMMAND, {media: MediaType.BROADCAST, stream:streamName});			
			sendNotification(VideoModuleConstants.STOPPED_BROADCAST, streamName);
		}

		override public function onRemove():void {
			LogUtil.debug('REMOVING MEDIATOR: ' + NAME);
		}	
	}
}