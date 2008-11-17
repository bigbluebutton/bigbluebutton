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
package org.bigbluebutton.modules.video.model.services
{

	import flash.events.*;
	import flash.media.*;
	import flash.net.*;
	
//	import org.bigbluebutton.modules.video.model.business.PublisherModel;
	import org.bigbluebutton.modules.video.model.vo.PlayMedia;
	import org.bigbluebutton.modules.video.model.vo.PlaybackState;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;
	
	/**
	 * The PlayStreamDelegate manages a recorded stream
	 * <p>
	 * This class extends the proxy class of the puremvc framework
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class PlayStreamDelegate extends Proxy implements IProxy
	{	
		public static const NAME:String = "PlayeStreamDelegate";
			
		private var nsPlay : NetStream;
		private var media : PlayMedia;
		private var playbackFinished : Boolean = false;
		
		/**
		 * Creates a new PlayStreamDelegate object 
		 * @param playMedia
		 * 
		 */		
		public function PlayStreamDelegate( playMedia:PlayMedia)
		{
			super(NAME);
			media = playMedia;
		}
		
//		private function get model():PublisherModel{
//			return facade.retrieveProxy(PublisherModel.NAME) as PublisherModel;
//		}
//		
//		private function get delegate():NetworkConnectionDelegate{
//			return facade.retrieveProxy(NetworkConnectionDelegate.NAME) as NetworkConnectionDelegate;
//		}
					
		/**
		 * Starts playing back the media on the server 
		 * @param bufferTime
		 * @param streamName
		 * @param audio
		 * @param video
		 * 
		 */		
		public function startPlayback( bufferTime : int, 
									   streamName : String, 
									   audio : Boolean,
									   video : Boolean ) : void
		{
			try 
			{
				// Check for reconnect.
				if ( nsPlay != null ) 
				{
					// Stop and close previous NetStream.
					//var media:PlayMedia = model.getPlayMedia(streamName) as PlayMedia;
					media.playStreamDelegate.stopPlayback();
				}
				// Setup NetStream for playback.
//				nsPlay = new NetStream( delegate.connection );
				
				nsPlay.addEventListener( NetStatusEvent.NET_STATUS, netStatusEvent );
				nsPlay.addEventListener( IOErrorEvent.IO_ERROR, netIOError );
				nsPlay.addEventListener( AsyncErrorEvent.ASYNC_ERROR, netASyncError );
				
				nsPlay.bufferTime = bufferTime;
				nsPlay.receiveAudio( audio );
				nsPlay.receiveVideo( video );
				
				nsPlay.client = this;
				
				media.playState = PlaybackState.PLAYING;
				
//				media.remoteVideo = new Video( model.defaultVideoSettings.width, 
//						model.defaultVideoSettings.height );
				media.remoteVideo.attachNetStream( nsPlay );
				
				nsPlay.play( streamName );
				
			}
			catch( e : ArgumentError ) 
			{
				media.playState = PlaybackState.STOPPED;
				
				// Invalid parameters
				switch ( e.errorID ) 
				{
					// NetStream object must be connected.
					case 2126 :						
						//log.error( "StreamDelegate::Can't play stream, not connected to server");
						break;
					default :
					   break;
				}
			}
		}
		
		/**
		 * Stops playback of the recorded media
		 */		
		public function stopPlayback() : void
		{
			if ( nsPlay != null ) 
			{
				media.playState = PlaybackState.STOPPED;
				//log.warn("PlayMedia[" + media.streamName + "] stopped.");
				// Close the NetStream.
				nsPlay.close();
				if (media.remoteVideo != null) 
						media.remoteVideo = null;				
			}
		}
		
		/**
		 * Pause playback.
		 */		
		public function pausePlayback() : void
		{
			media.playState = PlaybackState.PAUSED;
			
			// Pause the NetStream.
			nsPlay.pause();
		}
		
		/**
		 * Resume playback.
		 */		
		public function resumePlayback() : void
		{
			media.playState = PlaybackState.PLAYING;
			
			// Resume playback for the NetStream.
			nsPlay.resume();
		}
		
		/**
		 * Enables audio 
		 * @param enable
		 * 
		 */		
		public function enableAudio( enable : Boolean ) : void
		{
			nsPlay.receiveAudio( enable );
		}
		
		/**
		 * Enables video 
		 * @param enable
		 * 
		 */			
		public function enableVideo( enable : Boolean ) : void
		{
			
			nsPlay.receiveVideo( enable );
		}
					
		/**
		 * Called when a net_status_event is received 
		 * @param event
		 * 
		 */		
		protected function netStatusEvent( event : NetStatusEvent ) : void 
		{
			handleResult( event );
		}
		
		/**
		 * Called when a net_security_error is received 
		 * @param event
		 * 
		 */		
		protected function netSecurityError( event : SecurityErrorEvent ) : void 
		{
			handleFault( new SecurityErrorEvent ( SecurityErrorEvent.SECURITY_ERROR, false, true,
		    										  "Security error - " + event.text ) );
		}
			
		/**
		 * Called when a net_io_error is received 
		 * @param event
		 * 
		 */		
		protected function netIOError( event : IOErrorEvent ) : void 
		{
			handleFault( new IOErrorEvent ( IOErrorEvent.IO_ERROR, false, true, 
							 "Input/output error - " + event.text ) );
		}
				
		/**
		 * Called when a net_async_error is received 
		 * @param event
		 * 
		 */		
		protected function netASyncError( event : AsyncErrorEvent ) : void 
		{
			handleFault( new AsyncErrorEvent ( AsyncErrorEvent.ASYNC_ERROR, false, true,
							 "Asynchronous code error - <i>" + event.error + "</i>" ) );
		}
		
		/**
		 * Called when a result is received from the server 
		 * @param event
		 * 
		 */		
		public function handleResult(  event : Object  ) : void 
		{
			var info : Object = event.info;
			var statusCode : String = info.code;

			switch ( statusCode ) {
				case "NetStream.Play.Start" :
					// Start playback.
					playbackStarted();
					break;
					
				case "NetStream.Play.Stop":	
					playbackFinished = true;		
					break;
				
				case "NetStream.Buffer.Empty":	
					if ( playbackFinished ) 
					{
						// Playback stopped.
						playbackStopped();
					}	
					break;
				
				case "NetStream.Play.UnpublishNotify":
					// Playback stopped.
					playbackStopped();
					break;
					
				case "NetStream.Play.StreamNotFound":
					playbackStopped();
					break;
				
				case "NetStream.Pause.Notify":
					//log.info("NetStream.Pause.Notify for broadcast stream [" + media.streamName + "]");				
					break;
					
				case "NetStream.Unpause.Notify":
					//log.info("NetStream.Unpause.Notify for broadcast stream [" + media.streamName + "]");
					break;
					
				case "NetStream.Publish.Start":
					// Shouldn't be getting this since we are playing and NOT broadcasting
					//log.warn("NetStream.Publish.Start for broadcast stream [" + media.streamName + "]");
					break;
					
				case "NetStream.Publish.Idle":
				// Shouldn't be getting this since we are playing and NOT broadcasting
					//log.warn("NetStream.Publish.Idle for broadcast stream [" + media.streamName + "]");
					break;
					
				case "NetStream.Record.Failed":
				// Shouldn't be getting this since we are playing and NOT broadcasting
					//log.warn("NetStream.Record.Failed for broadcast stream [" + media.streamName + "]");
					break;
					
				case "NetStream.Record.Stop":
					//log.warn("NetStream.Record.Stop for broadcast stream [" + media.streamName + "]");
					break;
					
				case "NetStream.Record.Start":
					//log.warn("NetStream.Record.Start for broadcast stream [" + media.streamName + "]");
					break;
					
				case "NetStream.Unpublish.Success":
					//log.warn("NetStream.Unpublish.Success for broadcast stream [" + media.streamName + "]");;
					break;
					
				case "NetStream.Publish.BadName":
					//log.warn("NetStream.Publish.BadName for broadcast stream [" + media.streamName + "]");
					break;
			}
		}
				
		/**
		 * sets the state of the playback to 'playing' 
		 * 
		 */		
		private function playbackStarted() : void
		{
			playbackFinished = false;
			media.playState = PlaybackState.PLAYING;
		}
						
		/**
		 * Sets the state of the playback to 'stopped' 
		 * 
		 */			
		private function playbackStopped() : void
		{
			playbackFinished = false;
			media.playState = PlaybackState.STOPPED;
			if (media.remoteVideo != null) 
				media.remoteVideo = null;
		}
				
		/**
		 * Called when a fault is received from the server 
		 * @param event
		 * 
		 */		
		public function handleFault(  event : Object  ) : void
		{			
			//log.error("BroadcastStreamDelegate::" + event.text );
			playbackStopped();
		}
			
		public function onPlayStatus( info : Object ) : void 
		{	
			//log.debug("BroadcastStreamDelegate::Playback - " + info.code  );
		}
			
		public function onMetaData ( info : Object ) : void 
		{
			for ( var d : String in info ) 
			{
				//log.info( "Metadata - " + d + ": " + info[ d ]);
			}
		}
					
		public function onCuePoint( info : Object ) : void 
		{
			for ( var d : String in info ) 
			{
				//log.info( "Cuepoint - " + d + ": " + info[ d ] );
			}
		}
		
    }
}