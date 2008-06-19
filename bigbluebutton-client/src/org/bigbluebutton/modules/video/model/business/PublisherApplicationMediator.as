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
package org.red5.samples.publisher
{
	import flash.net.ObjectEncoding;
	
	import org.bigbluebutton.modules.video.VideoFacade;
	import org.bigbluebutton.modules.video.control.notifiers.PlayStreamNotifier;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	import org.red5.samples.publisher.control.commands.*;
	import org.red5.samples.publisher.model.*;
	import org.red5.samples.publisher.vo.settings.*;
	
	/**
	 * This is one of the mediator classes of the video module. It holds much of the business logic 
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class PublisherApplicationMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "PublisherApplicationMediator";
		
		private var modelLoc : PublisherModelLocator = PublisherModelLocator.getInstance();
		private var log : ILogger = LoggerModelLocator.getInstance().log;

		private var model : PublisherModel = PublisherModelLocator.getInstance().model;
					
		/**
		 * Creates a new PublisherApplicationMediator 
		 * 
		 */			
		public function PublisherApplicationMediator() {
			super(NAME);
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
					VideoFacade.STOP_STREAM_COMMAND
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
		public function getBroadcastMedia(streamName : String) : IMedia
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
			
			log.debug("Publisher connecting to <b>" + host + "</b>");
			
			var startConnectionCommand : StartConnectionCommand 
					= new StartConnectionCommand( host,
											proxyType,
											encodingType);
																							
			startConnectionCommand.dispatch();
		}
		
		/**
		 * Sends out a disconnect notification 
		 * 
		 */		
		public function disconnect() : void
		{
			var closeCmd : CloseConnectionCommand = new CloseConnectionCommand();
			closeCmd.dispatch();			
		}
		
		/**
		 * Sends out a setup devices notification 
		 * 
		 */		
		public function setupDevices() : void
		{
			var devicesCmd : SetupDevicesCommand = new SetupDevicesCommand();
			devicesCmd.dispatch();			
		}
		
		/**
		 * Sends out a setup connection notification 
		 * 
		 */		
		public function setupConnection() : void
		{
			var connectionCmd : SetupConnectionCommand = new SetupConnectionCommand();
			connectionCmd.dispatch();			
		}
		
		/**
		 * Sends out a setup_stream notification 
		 * @param streamName
		 * 
		 */		
		public function setupStream(streamName : String) : void
		{
			var streamsCmd : SetupStreamsCommand = new SetupStreamsCommand(streamName);
			streamsCmd.dispatch();			
		}

		/**
		 * Sends out a stop_camera notification 
		 * @param streamName
		 * 
		 */		
		public function stopCamera(streamName : String) : void
		{
			var stopCameraCmd : StopCameraCommand = new StopCameraCommand(streamName);
			stopCameraCmd.dispatch();			
		}
		
		/**
		 * Sends out a start_camera notification 
		 * @param streamName
		 * 
		 */		
		public function startCamera(streamName : String) : void
		{						
			var startCameraCmd : StartCameraCommand 
						= new StartCameraCommand( streamName);
				startCameraCmd.dispatch();			

		}
		
		/**
		 * Sends out a start_microphone notification 
		 * @param streamName
		 * 
		 */		
		public function startMicrophone(streamName : String) : void
		{
			var startMicrophoneCmd : StartMicrophoneCommand 
						= new StartMicrophoneCommand( streamName );
			startMicrophoneCmd.dispatch();						

		}
		
		/**
		 * Sends out a stop_microphone notification 
		 * @param streamName
		 * 
		 */		
		public function stopMicrophone(streamName : String) : void
		{
			var stopMicrophoneCmd : StopMicrophoneCommand = new StopMicrophoneCommand(streamName);
			stopMicrophoneCmd.dispatch();			
		}
		
		/**
		 * Broadcast a stream to other users.
		 * 
		 * @param publishMode Can be [live, record, append]
		 * @param streamName the name of the stream to bradcast
		 */		
		public function startBroadcasting(publishMode : String, streamName : String) : void
		{
			log.debug("Start broadcasting[" + publishMode + "," + streamName + "]");
			
			var publishStreamCmd : PublishStreamCommand = new PublishStreamCommand( publishMode, streamName );
			publishStreamCmd.dispatch();			
		}
		
		/**
		 * Sends out an unpiblish_stream notification 
		 * @param streamName
		 * 
		 */		
		public function stopBroadcasting(streamName : String) : void
		{
			var unpublishStreamCmd : UnpublishStreamCommand = new UnpublishStreamCommand(streamName);
			unpublishStreamCmd.dispatch();			
		}
		
		/**
		 * Sends out a pause_stream notification 
		 * @param streamName
		 * 
		 */		
		public function pauseStream(streamName : String) : void
		{
			// Pause playback.
			var pauseStreamCmd : PauseStreamCommand = new PauseStreamCommand(streamName);
			pauseStreamCmd.dispatch();			
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
			// Start playback from beginning.
			var playStreamCmd : PlayStreamCommand
					= new PlayStreamCommand( streamName,
										 enableVideo,
										 enableAudio );	
			playStreamCmd.dispatch();		
		}	
		
		/**
		 * sends out a resume_stream notification 
		 * @param streamName
		 * 
		 */		
		public function resumeStream(streamName : String) : void
		{
			// Resume playback.
			var resumeStreamCmd : ResumeStreamCommand = new ResumeStreamCommand(streamName);
			resumeStreamCmd.dispatch(); 			
		}		
		
		/**
		 * sends out a stop_stream notification 
		 * @param streamName
		 * 
		 */		
		public function stopStream(streamName : String) : void
		{	
			// Stop playback and close stream.
			var stopStreamCmd : StopStreamCommand = new StopStreamCommand(streamName);
			stopStreamCmd.dispatch();			
		}	
		
		/**
		 * sends out an enable_audio notification 
		 * @param streamName
		 * @param enableAudio
		 * 
		 */		
		public function enableAudio(streamName : String, enableAudio : Boolean) : void
		{
			var toggleAudioCmd : EnableAudioCommand = new EnableAudioCommand(streamName, enableAudio );
			toggleAudioCmd.dispatch();			
		}	
		
		/**
		 * sends out an enable_video notification 
		 * @param streamName
		 * @param enableVideo
		 * 
		 */		
		public function enableVideo(streamName : String, enableVideo : Boolean) : void
		{
			var toggleVideoCmd : EnableVideoCommand = new EnableVideoCommand(streamName, enableVideo );
			toggleVideoCmd.dispatch();			
		}
	}
}