package org.bigbluebutton.modules.video.model
{
	import flash.media.Camera;
	import flash.media.Microphone;
	
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.modules.video.model.business.MediaManager;
	import org.bigbluebutton.modules.video.model.business.MediaType;
	import org.bigbluebutton.modules.video.model.services.StreamFactory;
	import org.bigbluebutton.modules.video.model.vo.BroadcastMedia;
	import org.bigbluebutton.modules.video.model.vo.IMedia;
	import org.bigbluebutton.modules.video.model.vo.PlayMedia;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;

	public class MediaProxy extends Proxy implements IProxy
	{
		public static const NAME:String = "MediaProxy";
		
		private var _mediaManager:MediaManager = new MediaManager();
		private var _sf:StreamFactory;
		
		
		public function MediaProxy()
		{
			super(NAME);
		}

		public function setup():void {
			setupStreamFactory();
			setupDevices();
		}
		
		public function setupStreamFactory():void {
			if (facade.hasProxy(ConnectionProxy.NAME)) {
				var p:ConnectionProxy = facade.retrieveProxy(ConnectionProxy.NAME) as ConnectionProxy;
				_sf = new StreamFactory(p.connection);
			}
			
		}
		
		public function stopAllStreams():void {
			_mediaManager.stopAllMedia();			
		}
		
		/**
		 * Creates a new broadcast stream 
		 * @param streamName - the name of the stream to be created
		 * 
		 */		
		public function createBroadcastMedia(streamName:String):void
		{
			_mediaManager.createBroadcastMedia(streamName);
		}
		
		/**
		 * Creates a new play stream 
		 * @param streamName - the name of the stream to be created
		 * 
		 */		
		public function createPlayMedia(streamName : String) : void
		{
			_mediaManager.createPlayMedia(streamName);
		}
				
		/**
		 * Returns the broadcast media with the given name 
		 * @param streamName
		 * @return 
		 * 
		 */		
		public function getBroadcastMedia(streamName : String):IMedia
		{
			return _mediaManager.getBroadcastMedia(streamName);
		}

		/**
		 * Returns the play media with the given name 
		 * @param streamName
		 * @return 
		 * 
		 */		
		public function getPlayMedia(streamName : String) : IMedia
		{
			return _mediaManager.getPlayMedia(streamName);
		}
		

		
		/**
		 * Sends out a setup devices notification 
		 * 
		 */		
		public function setupDevices() : void{
			if ( Camera.names.length != 0 ) {
					// Merge options with devices array.
					_mediaManager.cameraNames = _mediaManager.cameraNames.concat( Camera.names );
			}

			if ( Microphone.names.length != 0 ) {
				// Merge options with devices array.
				_mediaManager.microphoneNames = _mediaManager.microphoneNames.concat( Microphone.names );
			}		
		}
			
		public function setupStream(streamName : String) : void
		{
			var m:IMedia  = _mediaManager.getPlayMedia(streamName);
			
			if (m == null) {
				m = _mediaManager.getBroadcastMedia(streamName);
			}
			m.streamName = streamName;
			
			if (m.type == MediaType.BROADCAST) {
				var b:BroadcastMedia = m as BroadcastMedia;
				b.broadcastStream = _sf.createBroadcastStream();
			} else if (m.type == MediaType.PLAY)
			{
				var p : PlayMedia = m as PlayMedia;
				p.playStream = _sf.createPlayStream();
			}	
		}

		/**
		 * Sends out a stop_camera notification 
		 * @param streamName
		 * 
		 */		
		public function stopCamera(streamName : String) : void
		{
			var m:BroadcastMedia = _mediaManager.getBroadcastMedia(streamName) as BroadcastMedia;

			if (m != null) {
				if (m.video.localVideo != null) {
					// Disconnect video device.
					m.video.localVideo.attachCamera( null );
					m.video.localVideo = null;
					m.stopCamera();
					m.deviceStarted = false;
				}	
			}
			
	
		}
		
		/**
		 * Sends out a start_camera notification 
		 * @param streamName
		 * 
		 */		
		public function startCamera(streamName : String) : void
		{					
			var m:BroadcastMedia = _mediaManager.getBroadcastMedia(streamName) as BroadcastMedia;
			
			if (m != null) m.startCamera();
		}
				
		/**
		 * Sends out a start_microphone notification 
		 * @param streamName
		 * 
		 */		
		public function startMicrophone(streamName : String) : void
		{
			var m:BroadcastMedia = _mediaManager.getBroadcastMedia(streamName) as BroadcastMedia;			
			if (m != null) m.startMicrophone();	
		}
		
		/**
		 * Sends out a stop_microphone notification 
		 * @param streamName
		 * 
		 */		
		public function stopMicrophone(streamName : String) : void
		{
			var m:BroadcastMedia = _mediaManager.getBroadcastMedia(streamName) as BroadcastMedia;
			
			if (m == null) {
				m.stopMicrophone();
			}	
		}
		
		/**
		 * Broadcast a stream to other users.
		 * 
		 * @param publishMode Can be [live, record, append]
		 * @param streamName the name of the stream to bradcast
		 */		
		public function startBroadcasting(publishMode:String, streamName:String):void
		{
			var m:BroadcastMedia = _mediaManager.getBroadcastMedia(streamName) as BroadcastMedia;
			if (m != null) 	m.start(publishMode, streamName);		
		}
		
		/**
		 * Sends out an unpiblish_stream notification 
		 * @param streamName
		 * 
		 */		
		public function stopBroadcasting(streamName:String) : void
		{
			var m:BroadcastMedia = _mediaManager.getBroadcastMedia(streamName) as BroadcastMedia;
	    	if (m != null) m.stop();		
		}
		
		/**
		 * Sends out a pause_stream notification 
		 * @param streamName
		 * 
		 */		
		public function pauseStream(streamName:String) : void
		{
			var m:PlayMedia = _mediaManager.getPlayMedia(streamName) as PlayMedia;
	    	
	    	if (m != null) m.pause();		
		}
		
		public function playStream(streamName:String, enableVideo:Boolean, enableAudio:Boolean):void
		{
			var m:PlayMedia = _mediaManager.getPlayMedia(streamName) as PlayMedia;	  
			var p:ConnectionProxy = facade.retrieveProxy(ConnectionProxy.NAME) as ConnectionProxy;
			  	
	    	var bufferTime : int = p.generalSettings.bufferTime;
	    	
			if (m != null) m.start(bufferTime, streamName, enableVideo, enableAudio);	
		}	
		
		/**
		 * sends out a resume_stream notification 
		 * @param streamName
		 * 
		 */		
		public function resumeStream(streamName : String) : void
		{
			var m:PlayMedia = _mediaManager.getPlayMedia(streamName) as PlayMedia;
	    	
	    	if (m != null) m.resume();			
		}		
		
		/**
		 * sends out a stop_stream notification 
		 * @param streamName
		 * 
		 */		
		public function stopStream(streamName : String) : void
		{	
			// Stop playback and close stream.
			var m:PlayMedia = _mediaManager.getPlayMedia(streamName) as PlayMedia;
	    	
	    	if (m != null) m.stop();
	    			
		}	
		
		/**
		 * sends out an enable_audio notification 
		 * @param streamName
		 * @param enableAudio
		 * 
		 */		
		public function enableAudio(streamName:String, enableAudio:Boolean) : void
		{
			var m:PlayMedia = _mediaManager.getPlayMedia(streamName) as PlayMedia;
	    	
	    	if (m != null) m.enableAudio(enableAudio);	
		}	
		
		/**
		 * sends out an enable_video notification 
		 * @param streamName
		 * @param enableVideo
		 * 
		 */		
		public function enableVideo(streamName : String, enableVideo : Boolean) : void
		{
			var m:PlayMedia = _mediaManager.getPlayMedia(streamName) as PlayMedia;
	    	if (m != null) m.enableVideo(enableVideo);	
		}
	}
}