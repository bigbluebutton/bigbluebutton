/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2008 by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* This program is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with this program; if not, write to the Free Software Foundation, Inc.,
* 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
* 
*/
package org.bigbluebutton.modules.video.model.business
{
	import flash.events.ActivityEvent;
	import flash.events.StatusEvent;
	import flash.media.Camera;
	import flash.media.Microphone;
	import flash.media.SoundTransform;
	import flash.media.Video;
	import flash.net.ObjectEncoding;
	
	import org.bigbluebutton.modules.video.VideoFacade;
	import org.bigbluebutton.modules.video.control.notifiers.PlayStreamNotifier;
	import org.bigbluebutton.modules.video.control.notifiers.PublishNotifier;
	import org.bigbluebutton.modules.video.model.services.BroadcastStreamDelegate;
	import org.bigbluebutton.modules.video.model.services.NetworkConnectionDelegate;
	import org.bigbluebutton.modules.video.model.services.PlayStreamDelegate;
	import org.bigbluebutton.modules.video.model.vo.BroadcastMedia;
	import org.bigbluebutton.modules.video.model.vo.IMedia;
	import org.bigbluebutton.modules.video.model.vo.PlayMedia;
	import org.bigbluebutton.modules.video.model.vo.settings.GeneralSettings;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	/**
	 * This is one of the mediator classes of the video module. It holds much of the business logic 
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class PublisherApplicationMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "PublisherApplicationMediator";
					
		/**
		 * Creates a new PublisherApplicationMediator 
		 * 
		 */			
		public function PublisherApplicationMediator() {
			super(NAME);
		}
		
		public function get model():PublisherModel{
			return facade.retrieveProxy(PublisherModel.NAME) as PublisherModel;
		}
		
		public function get delegate():NetworkConnectionDelegate{
			return facade.retrieveProxy(NetworkConnectionDelegate.NAME) as NetworkConnectionDelegate;
		}
		
		/**
		 * Lists the notification to which this mediator listens to:
		 * 	VideoFacade.PAUSE_STREAM_COMMAND
		 * 	VideoFacade.PLAY_STREAM_COMMAND
		 * 	VideoFacade.RESUME_STREAM_COMMAND
		 * 	VideoFacade.STOP_STREAM_COMMAND 
		 * @return the array of string representing the insterests
		 * 
		 */		
		override public function listNotificationInterests():Array{
			return [
					VideoFacade.PAUSE_STREAM_COMMAND,
					VideoFacade.PLAY_STREAM_COMMAND,
					VideoFacade.RESUME_STREAM_COMMAND,
					VideoFacade.STOP_STREAM_COMMAND,
					VideoFacade.PUBLISH_STREAM_COMMAND,
					VideoFacade.UNPUBLISH_STREAM_COMMAND,
					VideoFacade.STOP_MICROPHONE_COMMAND,
					VideoFacade.STOP_CAMERA_COMMAND,
					VideoFacade.START_CAMERA_COMMAND,
					VideoFacade.START_MICROPHONE_COMMAND,
					VideoFacade.SETUP_DEVICES_COMMAND
					];
		}
		
		/**
		 * Handles the notifications upon reception 
		 * @param notification
		 * 
		 */		
		override public function handleNotification(notification:INotification):void{
			switch(notification.getName()){
				case VideoFacade.PAUSE_STREAM_COMMAND:
					pauseStream(notification.getBody() as String);
					break;
				case VideoFacade.PLAY_STREAM_COMMAND:
					var note:PlayStreamNotifier = notification.getBody() as PlayStreamNotifier;
					playStream(note.streamName, note.enableVideo, note.enableAudio);
					break;
				case VideoFacade.RESUME_STREAM_COMMAND:
					resumeStream(notification.getBody() as String);
					break;
				case VideoFacade.STOP_STREAM_COMMAND:
					stopStream(notification.getBody() as String);
					break;
				case VideoFacade.PUBLISH_STREAM_COMMAND:
					var publishNote:PublishNotifier = notification.getBody() as PublishNotifier;
					startBroadcasting(publishNote.publishMode, publishNote.streamName);
					break;
				case VideoFacade.UNPUBLISH_STREAM_COMMAND:
					stopBroadcasting(notification.getBody() as String);
					break;
				case VideoFacade.STOP_MICROPHONE_COMMAND:
					stopMicrophone(notification.getBody() as String);
					break;
				case VideoFacade.STOP_CAMERA_COMMAND:
					stopCamera(notification.getBody() as String);
					break;
				case VideoFacade.START_CAMERA_COMMAND:
					startCamera(notification.getBody() as String);
					break;
				case VideoFacade.START_MICROPHONE_COMMAND:
					startMicrophone(notification.getBody() as String);
					break;
				case VideoFacade.SETUP_DEVICES_COMMAND:
					setupDevices();
					break;
			}
		}
		
		/**
		 * Creates a new broadcast stream 
		 * @param streamName - the name of the stream to be created
		 * 
		 */		
		public function createBroadcastMedia(streamName : String) : void
		{
			model.createBroadcastMedia(streamName);
		}
		
		/**
		 * Creates a new play stream 
		 * @param streamName - the name of the stream to be created
		 * 
		 */		
		public function createPlayMedia(streamName : String) : void
		{
			model.createPlayMedia(streamName);
		}
				
		/**
		 * Returns the broadcast media with the given name 
		 * @param streamName
		 * @return 
		 * 
		 */		
		public function getBroadcastMedia(streamName : String):IMedia
		{
			return model.getBroadcastMedia(streamName);
		}

		/**
		 * Returns the play media with the given name 
		 * @param streamName
		 * @return 
		 * 
		 */		
		public function getPlayMedia(streamName : String) : IMedia
		{
			return model.getPlayMedia(streamName);
		}
		
		/**
		 * Connects this class to a specific host
		 * @param host
		 * 
		 */				
		public function connect(host : String) : void
		{
			var encodingType : uint = ObjectEncoding.AMF0;
			var proxyType : String = "none";
			var serverType : int = 0; // Red5
			
			model.generalSettings = new GeneralSettings( host,
														serverType,
														encodingType,
														0 /*"none"*/ );
			
			//log.debug("Publisher connecting to <b>" + host + "</b>");
			
			delegate.connect(host,proxyType,encodingType);
		}
		
		/**
		 * Sends out a disconnect notification 
		 * 
		 */		
		public function disconnect() : void
		{
			delegate.close();	
		}
		
		/**
		 * Sends out a setup devices notification 
		 * 
		 */		
		public function setupDevices() : void{
			if ( Camera.names.length != 0 ) {
					// Merge options with devices array.
					model.cameraNames = model.cameraNames.concat( Camera.names );
			}

			if ( Microphone.names.length != 0 ) {
				// Merge options with devices array.
				model.microphoneNames = model.microphoneNames.concat( Microphone.names );
			}		
		}
		
		/**
		 * Sends out a setup connection notification 
		 * 
		 */		
		public function setupConnection() : void
		{
			facade.registerProxy(new NetworkConnectionDelegate());			
		}
		
		/**
		 * Sends out a setup_stream notification 
		 * @param streamName
		 * 
		 */		
		public function setupStream(streamName : String) : void
		{
			var media:IMedia  = model.getPlayMedia(streamName);
			
			if (media == null) {
				media = model.getBroadcastMedia(streamName);
			}
			media.streamName = streamName;
			
			if (media.type == MediaType.BROADCAST) {
				var m : BroadcastMedia = media as BroadcastMedia;
				var d:BroadcastStreamDelegate = new BroadcastStreamDelegate(m);
				m.broadcastStreamDelegate = d;
				facade.registerProxy(d);
			} else if (media.type == MediaType.PLAY)
			{
				var p : PlayMedia = media as PlayMedia;
				var playStream:PlayStreamDelegate = new PlayStreamDelegate(p);
				p.playStreamDelegate = playStream;
				facade.registerProxy(playStream);
			}	
		}

		/**
		 * Sends out a stop_camera notification 
		 * @param streamName
		 * 
		 */		
		public function stopCamera(streamName : String) : void
		{
			var media : BroadcastMedia = model.getBroadcastMedia(streamName) as BroadcastMedia;

			if (media == null) {
				//log.debug("Stopping camera[" + cmd.stream + "] with media NULL");
			}
			
			if (media.video.localVideo != null) {
				// Disconnect video device.
				media.video.localVideo.attachCamera( null );
				media.video.localVideo = null;
				media.broadcastStreamDelegate.stopCamera();
				media.deviceStarted = false;
			}		
		}
		
		/**
		 * Sends out a start_camera notification 
		 * @param streamName
		 * 
		 */		
		public function startCamera(streamName : String) : void
		{		
			var camera : Camera; 			
			var media : BroadcastMedia = model.getBroadcastMedia(streamName) as BroadcastMedia;
			
			var selectedCamIndex : int = 	media.video.settings.cameraIndex;
			var keyFrameInterval : int = 	media.video.settings.keyframe;
			var cameraWidth : int = 		media.video.settings.width;
			var cameraHeight : int = 		media.video.settings.height;
			var cameraFPS : int = 			media.video.settings.fps;
			var cameraBandwidth : int = 	media.video.settings.bandwidth;
			var cameraQuality : int = 		media.video.settings.quality;
			var cameraIndex : String =		String( selectedCamIndex - 1 );
			
			media.video.cam = Camera.getCamera( cameraIndex );
			
			camera = media.video.cam;
			camera.setKeyFrameInterval( keyFrameInterval );
			camera.setMode( cameraWidth, cameraHeight, cameraFPS );
			camera.setQuality( cameraBandwidth, cameraQuality );
			
			camera.addEventListener( ActivityEvent.ACTIVITY, activityEventHandler );
			camera.addEventListener( StatusEvent.STATUS, statusEventHandler );
			
			// update video stream when publishing
			if ( media.broadcastStreamDelegate.nsPublish != null ) 
			{
				media.broadcastStreamDelegate.nsPublish.attachCamera( camera );
			}
			
			//log.debug( "StartCameraCommand::Started video device <b>" + camera.name + "</b>");
			
			media.video.localVideo = new Video( 320, 240 );
			media.video.localVideo.attachCamera( camera );

			media.deviceStarted = true;		
		}
		
		private function activityEventHandler( event : ActivityEvent ) : void 
		{
		//	log.debug( "StartCameraCommand::activityEventHandler: " + event );
		}
				
		private function statusEventHandler( event : StatusEvent ) : void 
		{
		//	log.debug( "StartCameraCommand::statusEventHandler: " + event );
		}
		
		/**
		 * Sends out a start_microphone notification 
		 * @param streamName
		 * 
		 */		
		public function startMicrophone(streamName : String) : void
		{
			var microphone:Microphone;
			var media : BroadcastMedia = model.getBroadcastMedia(streamName) as BroadcastMedia;			
			
			var selectedMicIndex : int = 	media.audio.settings.micIndex;
			var gain : int = 				media.audio.settings.gain;
			var rate : int = 				media.audio.settings.rate;
			var level : int = 				media.audio.settings.level;
			var timeout : int = 			media.audio.settings.timeout;
			var micIndex : int = 			selectedMicIndex - 1;
			
			media.audio.mic = Microphone.getMicrophone( micIndex );
			microphone = media.audio.mic;
			
			microphone.setLoopBack( true );
			
			var transform : SoundTransform = microphone.soundTransform;
			transform.volume = 0;
			
			microphone.setUseEchoSuppression( true );
			microphone.soundTransform = transform;
			microphone.gain = gain;
			microphone.rate = rate;
			microphone.setSilenceLevel( level, timeout );
			
			microphone.addEventListener( ActivityEvent.ACTIVITY, activityEventHandler );
			microphone.addEventListener( StatusEvent.STATUS, statusEventHandler );
			
			// update audio stream when we're already publishing.
			if ( media.broadcastStreamDelegate.nsPublish != null ) 
			{
				media.broadcastStreamDelegate.nsPublish.attachAudio( microphone );
				media.deviceStarted = true;
			}					

		}
		
		/**
		 * Sends out a stop_microphone notification 
		 * @param streamName
		 * 
		 */		
		public function stopMicrophone(streamName : String) : void
		{
			var media : BroadcastMedia = model.getBroadcastMedia(streamName) as BroadcastMedia;
			
			if (media == null) {
				//log.debug("Stopping microphone[" + cmd.stream + "] with media NULL");
			}
				    	
			// disconnect mic
			if ( media.audio.mic != null ) 
			{
				media.audio.mic.setLoopBack( false );
				
				media.broadcastStreamDelegate.stopMicrophone();
				media.deviceStarted = false;
			}		
		}
		
		/**
		 * Broadcast a stream to other users.
		 * 
		 * @param publishMode Can be [live, record, append]
		 * @param streamName the name of the stream to bradcast
		 */		
		public function startBroadcasting(publishMode : String, streamName : String) : void
		{
			//Alert.show("AAAAR");
			var media : BroadcastMedia = model.getBroadcastMedia(streamName) as BroadcastMedia;
	    				
			// Use Delegate to publish the NetStream.
	      	media.broadcastStreamDelegate.startPublish( publishMode, streamName );		
		}
		
		/**
		 * Sends out an unpiblish_stream notification 
		 * @param streamName
		 * 
		 */		
		public function stopBroadcasting(streamName : String) : void
		{
			var media : BroadcastMedia = model.getBroadcastMedia(streamName) as BroadcastMedia;
	    				
			// Use Delegate to publish the NetStream.
	      	media.broadcastStreamDelegate.stopPublish();		
		}
		
		/**
		 * Sends out a pause_stream notification 
		 * @param streamName
		 * 
		 */		
		public function pauseStream(streamName : String) : void
		{
			var media : PlayMedia = model.getPlayMedia(streamName) as PlayMedia;
	    	
	    	// Use Delegate to pause NetStream.
	      	media.playStreamDelegate.pausePlayback();		
		}
		
		/**
		 * Sends out a play_stream notification 
		 * @param streamName
		 * @param enableVideo
		 * @param enableAudio
		 * 
		 */		
		public function playStream(streamName : String, enableVideo : Boolean, enableAudio : Boolean) : void
		{
			var media : PlayMedia = model.getPlayMedia(streamName) as PlayMedia;
	    	
	    	var bufferTime : int = model.generalSettings.bufferTime;
	    	
			// Use Delegate to playback the NetStream.
	      	media.playStreamDelegate.startPlayback( bufferTime, streamName, enableVideo, enableAudio );	
		}	
		
		/**
		 * sends out a resume_stream notification 
		 * @param streamName
		 * 
		 */		
		public function resumeStream(streamName : String) : void
		{
			var media : PlayMedia = model.getPlayMedia(streamName) as PlayMedia;
	    	
	    	// Use Delegate to resume playback for the NetStream.
	      	media.playStreamDelegate.resumePlayback();			
		}		
		
		/**
		 * sends out a stop_stream notification 
		 * @param streamName
		 * 
		 */		
		public function stopStream(streamName : String) : void
		{	
			// Stop playback and close stream.
			var media : PlayMedia = model.getPlayMedia(streamName) as PlayMedia;
	    	
	    	// Use Delegate to close NetStream.
	      	media.playStreamDelegate.stopPlayback();		
		}	
		
		/**
		 * sends out an enable_audio notification 
		 * @param streamName
		 * @param enableAudio
		 * 
		 */		
		public function enableAudio(streamName : String, enableAudio : Boolean) : void
		{
			var media : PlayMedia = model.getPlayMedia(streamName) as PlayMedia;
	    	
			// Use Delegate to control the audio of the NetStream.
	      	media.playStreamDelegate.enableAudio( enableAudio );	
		}	
		
		/**
		 * sends out an enable_video notification 
		 * @param streamName
		 * @param enableVideo
		 * 
		 */		
		public function enableVideo(streamName : String, enableVideo : Boolean) : void
		{
			var media : PlayMedia = model.getPlayMedia(streamName) as PlayMedia;
	    	
			// Use Delegate to playback the NetStream.
	      	media.playStreamDelegate.enableVideo( enableVideo );		
		}
	}
}