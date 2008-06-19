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
	
	import org.bigbluebutton.modules.video.model.business.PublisherModel;
	import org.bigbluebutton.modules.video.model.vo.BroadcastMedia;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;
	
	/**
	 * The BroadcastStreamDelegate manages a live video stream
	 * <p>
	 * This class extends the Proxy class of the puremvc framework
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class BroadcastStreamDelegate extends Proxy implements IProxy
	{	
		public static const NAME:String = "BroadcastStreamDelegate";	
		
		private var media : BroadcastMedia;
		public var nsPublish : NetStream;
			
		/**
		 * Creates a new BroadcastStreamDelegate 
		 * @param broadcastMedia
		 * 
		 */		
		public function BroadcastStreamDelegate( broadcastMedia:BroadcastMedia )
		{
			super(NAME);
			media = broadcastMedia;
		}
		
		private function get model():PublisherModel{
			return facade.retrieveProxy(PublisherModel.NAME) as PublisherModel;
		}
		
		private function get delegate():NetworkConnectionDelegate{
			return facade.retrieveProxy(NetworkConnectionDelegate.NAME) as NetworkConnectionDelegate;
		}
						
		/**
		 * Start publishing the real time video to the server 
		 * @param publishMode
		 * @param streamName
		 * 
		 */		
		public function startPublish( publishMode : String, streamName : String ) : void
		{
			if (! model.connected) return;
			
			try 
			{
				var camera : Camera = media.video.cam;
				var microphone : Microphone = media.audio.mic;
				
				if ( microphone != null || camera != null ) 
				{
					// close previous stream
					if ( nsPublish != null ) 
					{
						// Stop and unpublish current NetStream.
						var media:BroadcastMedia = model.getBroadcastMedia(streamName) as BroadcastMedia;
						media.broadcastStreamDelegate.stopPublish();
					}
					// Setup NetStream for publishing.
					nsPublish = new NetStream( delegate.connection );
					//
					nsPublish.addEventListener( NetStatusEvent.NET_STATUS, netStatusEvent );
					nsPublish.addEventListener( IOErrorEvent.IO_ERROR, netIOError );
					nsPublish.addEventListener( AsyncErrorEvent.ASYNC_ERROR, netASyncError );
					
					nsPublish.client = this;	
					
					// attach devices to NetStream.
					if ( camera != null ) 
					{
						nsPublish.attachCamera( camera );
					}
					if ( microphone != null) 
					{
						nsPublish.attachAudio( microphone );
					}
					
					media.broadcasting = true;
					// Start publishing.
					nsPublish.publish( streamName, publishMode );
				} 
				else 
				{
					//log.warn( "StreamDelegate::Can't publish stream, no input device(s) selected" );
					
					media.broadcasting = false;
				}
			}
			catch( e : ArgumentError ) 
			{				
				media.broadcasting = false;
			
				// Invalid parameters
				switch ( e.errorID ) 
				{
					// NetStream object must be connected.
					case 2126 :
						//
						//log.error( "StreamDelegate::Can't publish stream, not connected to server" );
						break;
					//
					default :
					   //
					   //log.error( "StreamDelegate::" + e.toString());
					   break;
				}
			}
		}
			
		/**
		 * Stop publishing the rel time video 
		 * 
		 */		
		public function stopPublish() : void
		{	
			nsPublish.close();	
			media.broadcasting = false;
		}
		
		/**
		 * Stop publishing the audio 
		 * 
		 */		
		public function stopMicrophone() : void
		{
			// update audio stream when publishing
			if ( nsPublish != null ) 
			{
				nsPublish.attachAudio( null );
			}				
		}	
		
		/**
		 * Stop the camera only 
		 * 
		 */		
		public function stopCamera() : void
		{
			// Update video stream when publishing.
			if ( nsPublish != null ) 
			{
				nsPublish.attachCamera( null );
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
					//log.warn("NetStream.Play.Start for broadcast stream [" + media.streamName + "]");
					break;
					
				case "NetStream.Play.Stop":	
					// Shouldn't be getting this playback since we are broadcasting
					//log.warn("NetStream.Play.Stop for broadcast stream [" + media.streamName + "]");		
					break;
				
				case "NetStream.Buffer.Empty":	
					// Shouldn't be getting this playback since we are broadcasting
					//log.warn("NetStream.Buffer.Empty for broadcast stream [" + media.streamName + "]");	
					break;
				
				case "NetStream.Play.UnpublishNotify":
					// Shouldn't be getting this playback since we are broadcasting
					//log.warn("NetStream.Play.UnpublishNotify for broadcast stream [" + media.streamName + "]");
					break;
					
				case "NetStream.Play.StreamNotFound":
					// Shouldn't be getting this playback since we are broadcasting
					//log.warn("NetStream.Play.StreamNotFound for broadcast stream [" + media.streamName + "]");
					break;
				
				case "NetStream.Pause.Notify":
					// Shouldn't be getting this playback since we are broadcasting
					//log.warn("NetStream.Pause.Notify for broadcast stream [" + media.streamName + "]");				
					break;
					
				case "NetStream.Unpause.Notify":
					// Shouldn't be getting this playback since we are broadcasting
					//log.warn("NetStream.Unpause.Notify for broadcast stream [" + media.streamName + "]");
					break;
					
				case "NetStream.Publish.Start":
					media.broadcasting = true;
					//log.info("NetStream.Publish.Start for broadcast stream [" + media.streamName + "]");
					break;
					
				case "NetStream.Publish.Idle":
					//log.info("NetStream.Publish.Idle for broadcast stream [" + media.streamName + "]");
					break;
					
				case "NetStream.Record.Failed":
					//log.info("NetStream.Record.Failed for broadcast stream [" + media.streamName + "]");
					publishStopped();
					break;
					
				case "NetStream.Record.Stop":
					//log.info("NetStream.Record.Stop for broadcast stream [" + media.streamName + "]");
					publishStopped();
					break;
					
				case "NetStream.Record.Start":
					//log.info("NetStream.Record.Start for broadcast stream [" + media.streamName + "]");
					media.broadcasting = true;
					break;
					
				case "NetStream.Unpublish.Success":
					//log.info("NetStream.Unpublish.Success for broadcast stream [" + media.streamName + "]");
					publishStopped();
					break;
					
				case "NetStream.Publish.BadName":
					//log.info("NetStream.Publish.BadName for broadcast stream [" + media.streamName + "]");
					publishStopped();
					break;
			}
		}
				
			
		/**
		 * Called when publishing has ceased 
		 * 
		 */		
		private function publishStopped() : void 
		{
			media.broadcasting = false;
		}
				
		/**
		 * Called when a fault was received by the server 
		 * @param event
		 * 
		 */		
		public function handleFault(  event : Object  ) : void
		{			
			//log.error("BroadcastStreamDelegate::" + event.text );
			stopPublish();
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