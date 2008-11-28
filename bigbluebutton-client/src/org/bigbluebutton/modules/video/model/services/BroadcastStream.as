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
	
	import org.bigbluebutton.modules.video.model.vo.BroadcastMedia;

	/**
	 * The BroadcastStream
	 * <p>
	 * @author Denis Zgonjanin
	 * 
	 */	
	 	
	public class BroadcastStream
	{	
		public static const NAME:String = "BroadcastStream";	
		
		private var _media:BroadcastMedia;
		private var _ns:NetStream;
		private var _nc:NetConnection;
			
		public function BroadcastStream( connection:NetConnection )
		{
			_nc = connection;
		}
		
		public function set media(broadcastMedia:BroadcastMedia):void {
			_media = broadcastMedia;
		}
		
		public function start(publishMode:String, streamName:String) : void
		{
			try 
			{
				var camera : Camera = _media.video.cam;
				var microphone : Microphone = _media.audio.mic;
				_media.broadcasting = false;
				
				if ( microphone != null || camera != null ) 
				{
					// close previous stream
					if ( _ns != null ) 
					{
						// Stop and unpublish current NetStream.
						stop();
					}
					// Setup NetStream for publishing.
					_ns = new NetStream( _nc );
					//
					_ns.addEventListener( NetStatusEvent.NET_STATUS, netStatusEvent );
					_ns.addEventListener( IOErrorEvent.IO_ERROR, netIOError );
					_ns.addEventListener( AsyncErrorEvent.ASYNC_ERROR, netASyncError );
					
					_ns.client = this;	
					
					// attach devices to NetStream.
					if ( camera != null ) 
					{
						_ns.attachCamera( camera );
					}
					if ( microphone != null) 
					{
						_ns.attachAudio( microphone );
					}
					_media.broadcasting = true;
					// Start publishing.
					_ns.publish( streamName, publishMode );
				} 
				else 
				{
					LogUtil.debug( "StreamDelegate::Can't publish stream, no input device(s) selected" );					
					_media.broadcasting = false;
				}
			}
			catch( e : ArgumentError ) 
			{				
				_media.broadcasting = false;
			
				// Invalid parameters
				switch ( e.errorID ) 
				{
					// NetStream object must be connected.
					case 2126 :
						//
						LogUtil.debug( "StreamDelegate::Can't publish stream, not connected to server" );
						break;
					//
					default :
					   //
					   LogUtil.debug( "StreamDelegate::" + e.toString());
					   break;
				}
			}
		}
			
		public function stop() : void
		{	
			stopMicrophone();
			stopCamera();
			_ns.close();	
			_media.broadcasting = false;
		}
		
		/**
		 * Stop publishing the audio 
		 * 
		 */		
		public function stopMicrophone() : void
		{
			// update audio stream when publishing
			if ( _ns != null ) 
			{
				_ns.attachAudio( null );
			}				
		}	
		
		public function attachCamera(camera:Camera):void {						
			if ( _ns != null ) 
			{
				_ns.attachCamera( camera );
			}
		}
		
		public function attachMicrophone(mic:Microphone):void {
			if ( _ns != null ) 
			{
				_ns.attachAudio(mic);
			}
		}
		
		/**
		 * Stop the camera only 
		 * 
		 */		
		public function stopCamera() : void
		{
			// Update video stream when publishing.
			if ( _ns != null ) 
			{
				_ns.attachCamera( null );
			}			
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
			// Pass SecurityErrorEvent to Command.
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
			// Pass IOErrorEvent to Command.
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
			// Pass AsyncErrorEvent to Command.
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
					// Shouldn't be getting this playback since we are broadcasting
					LogUtil.debug("NetStream.Play.Start for broadcast stream [" + _media.streamName + "]");
					break;
					
				case "NetStream.Play.Stop":	
					// Shouldn't be getting this playback since we are broadcasting
					LogUtil.debug("NetStream.Play.Stop for broadcast stream [" + _media.streamName + "]");		
					break;
				
				case "NetStream.Buffer.Empty":	
					// Shouldn't be getting this playback since we are broadcasting
					LogUtil.debug("NetStream.Buffer.Empty for broadcast stream [" + _media.streamName + "]");	
					break;
				
				case "NetStream.Play.UnpublishNotify":
					// Shouldn't be getting this playback since we are broadcasting
					LogUtil.debug("NetStream.Play.UnpublishNotify for broadcast stream [" + _media.streamName + "]");
					break;
					
				case "NetStream.Play.StreamNotFound":
					// Shouldn't be getting this playback since we are broadcasting
					LogUtil.debug("NetStream.Play.StreamNotFound for broadcast stream [" + _media.streamName + "]");
					break;
				
				case "NetStream.Pause.Notify":
					// Shouldn't be getting this playback since we are broadcasting
					LogUtil.debug("NetStream.Pause.Notify for broadcast stream [" + _media.streamName + "]");				
					break;
					
				case "NetStream.Unpause.Notify":
					// Shouldn't be getting this playback since we are broadcasting
					LogUtil.debug("NetStream.Unpause.Notify for broadcast stream [" + _media.streamName + "]");
					break;
					
				case "NetStream.Publish.Start":
					_media.broadcasting = true;
					LogUtil.debug("NetStream.Publish.Start for broadcast stream [" + _media.streamName + "]");
					break;
					
				case "NetStream.Publish.Idle":
					LogUtil.debug("NetStream.Publish.Idle for broadcast stream [" + _media.streamName + "]");
					break;
					
				case "NetStream.Record.Failed":
					LogUtil.debug("NetStream.Record.Failed for broadcast stream [" + _media.streamName + "]");
					publishStopped();
					break;
					
				case "NetStream.Record.Stop":
					LogUtil.debug("NetStream.Record.Stop for broadcast stream [" + _media.streamName + "]");
					publishStopped();
					break;
					
				case "NetStream.Record.Start":
					LogUtil.debug("NetStream.Record.Start for broadcast stream [" + _media.streamName + "]");
					_media.broadcasting = true;
					break;
					
				case "NetStream.Unpublish.Success":
					LogUtil.debug("NetStream.Unpublish.Success for broadcast stream [" + _media.streamName + "]");
					publishStopped();
					break;
					
				case "NetStream.Publish.BadName":
					LogUtil.debug("NetStream.Publish.BadName for broadcast stream [" + _media.streamName + "]");
					publishStopped();
					break;
			}
		}
				
	
		private function publishStopped() : void 
		{
			_media.broadcasting = false;
		}
				
		/**
		 * Called when a fault was received by the server 
		 * @param event
		 * 
		 */		
		public function handleFault(  event : Object  ) : void
		{			
			LogUtil.debug("BroadcastStreamDelegate::" + event.text );
			stop();
		}
		
		public function onPlayStatus( info : Object ) : void 
		{	
			LogUtil.debug("BroadcastStreamDelegate::Playback - " + info.code  );
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