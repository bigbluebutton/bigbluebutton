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
	
	import org.bigbluebutton.modules.video.model.vo.PlayMedia;
	import org.bigbluebutton.modules.video.model.vo.PlaybackState;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;
	
	/**
	 * The PlayStream
	 * <p>
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class PlayStream
	{	
		public static const NAME:String = "PlayStream";
			
		private var _ns:NetStream;
		private var _media:PlayMedia;
		private var _playbackFinished:Boolean = false;
		private var _nc:NetConnection;
			
		public function PlayStream(connection:NetConnection)
		{
			_nc = connection;
		}

		public function set media(playMedia:PlayMedia):void {
			_media = playMedia;
		}
									
		public function start( bufferTime : int, 
									   streamName : String, 
									   audio : Boolean,
									   video : Boolean ) : void
		{
			try 
			{
				// Check for reconnect.
				if ( _ns != null ) 
				{
					stop();
				}
				// Setup NetStream for playback.
				_ns = new NetStream(_nc);
				
				_ns.addEventListener( NetStatusEvent.NET_STATUS, netStatusEvent );
				_ns.addEventListener( IOErrorEvent.IO_ERROR, netIOError );
				_ns.addEventListener( AsyncErrorEvent.ASYNC_ERROR, netASyncError );
				
				_ns.bufferTime = bufferTime;
				_ns.receiveAudio( audio );
				_ns.receiveVideo( video );
				
				_ns.client = this;
				
				_media.playState = PlaybackState.PLAYING;
				_media.remoteVideo = new Video( _media.defaultVideoSettings.width, 
						_media.defaultVideoSettings.height );
				_media.remoteVideo.attachNetStream(_ns);
				
				_ns.play( streamName );
				
			}
			catch( e : ArgumentError ) 
			{
				_media.playState = PlaybackState.STOPPED;
				
				// Invalid parameters
				switch ( e.errorID ) 
				{
					// NetStream object must be connected.
					case 2126 :						
						LogUtil.debug( "StreamDelegate::Can't play stream, not connected to server");
						break;
					default :
					   break;
				}
			}
		}
		
		public function stop() : void
		{
			if (_ns != null) 
			{
				_media.playState = PlaybackState.STOPPED;
				// Close the NetStream.
				_ns.close();
				if (_media.remoteVideo != null) 
						_media.remoteVideo = null;				
			}
		}
			
		public function pause() : void
		{
			_media.playState = PlaybackState.PAUSED;
			
			// Pause the NetStream.
			_ns.pause();
		}
			
		public function resume() : void
		{
			_media.playState = PlaybackState.PLAYING;
			
			// Resume playback for the NetStream.
			_ns.resume();
		}
			
		public function enableAudio( enable : Boolean ) : void
		{
			_ns.receiveAudio( enable );
		}
			
		public function enableVideo( enable : Boolean ) : void
		{
			
			_ns.receiveVideo( enable );
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
					_playbackFinished = true;		
					break;
				
				case "NetStream.Buffer.Empty":	
					if ( _playbackFinished ) 
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
					LogUtil.debug("NetStream.Pause.Notify for broadcast stream [" + _media.streamName + "]");				
					break;
					
				case "NetStream.Unpause.Notify":
					LogUtil.debug("NetStream.Unpause.Notify for broadcast stream [" + _media.streamName + "]");
					break;
					
				case "NetStream.Publish.Start":
					// Shouldn't be getting this since we are playing and NOT broadcasting
					LogUtil.debug("NetStream.Publish.Start for broadcast stream [" + _media.streamName + "]");
					break;
					
				case "NetStream.Publish.Idle":
				// Shouldn't be getting this since we are playing and NOT broadcasting
					LogUtil.debug("NetStream.Publish.Idle for broadcast stream [" + _media.streamName + "]");
					break;
					
				case "NetStream.Record.Failed":
				// Shouldn't be getting this since we are playing and NOT broadcasting
					LogUtil.debug("NetStream.Record.Failed for broadcast stream [" + _media.streamName + "]");
					break;
					
				case "NetStream.Record.Stop":
					LogUtil.debug("NetStream.Record.Stop for broadcast stream [" + _media.streamName + "]");
					break;
					
				case "NetStream.Record.Start":
					LogUtil.debug("NetStream.Record.Start for broadcast stream [" + _media.streamName + "]");
					break;
					
				case "NetStream.Unpublish.Success":
					LogUtil.debug("NetStream.Unpublish.Success for broadcast stream [" + _media.streamName + "]");;
					break;
					
				case "NetStream.Publish.BadName":
					LogUtil.debug("NetStream.Publish.BadName for broadcast stream [" + _media.streamName + "]");
					break;
			}
		}
				
		/**
		 * sets the state of the playback to 'playing' 
		 * 
		 */		
		private function playbackStarted() : void
		{
			_playbackFinished = false;
			_media.playState = PlaybackState.PLAYING;
		}
						
		/**
		 * Sets the state of the playback to 'stopped' 
		 * 
		 */			
		private function playbackStopped() : void
		{
			_playbackFinished = false;
			_media.playState = PlaybackState.STOPPED;
			if (_media.remoteVideo != null) 
				_media.remoteVideo = null;
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