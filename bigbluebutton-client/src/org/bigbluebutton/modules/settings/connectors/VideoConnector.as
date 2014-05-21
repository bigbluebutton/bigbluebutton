/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/
package org.bigbluebutton.modules.settings.connectors
{
	import flash.events.AsyncErrorEvent;
	import flash.events.IOErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.SecurityErrorEvent;
	import flash.media.Camera;
	import flash.media.Video;
	import flash.net.NetConnection;
	import flash.net.NetStream;
	
	import org.bigbluebutton.modules.settings.util.Requirements;
	
	public class VideoConnector
	{
		public static const CONNECT_SUCCESS:String = "NetConnection.Connect.Success";
		public static const CONNECT_FAILED:String = "NetConnection.Connect.Failed";
		public static const CONNECT_CLOSED:String = "NetConnection.Connect.Closed";
		public static const INVALID_APP:String = "NetConnection.Connect.InvalidApp";
		public static const APP_SHUTDOWN:String = "NetConnection.Connect.AppShutDown";
		public static const CONNECT_REJECTED:String = "NetConnection.Connect.Rejected";
		public static const NETSTREAM_PUBLISH:String = "NetStream.Publish.Start";
				
		public var connection:NetConnection;
		private var outgoingStream:NetStream;
		private var incomingStream:NetStream;
		
		private var camera:Camera;
		private var streamListener:Function;
		
		public var streamName:String;
		
		public function VideoConnector(connectionListener:Function)
		{	
			connection = new NetConnection();
			connection.proxyType = "best";
			connection.client = this;
			connection.addEventListener(NetStatusEvent.NET_STATUS, onNetStatus);
			connection.addEventListener(NetStatusEvent.NET_STATUS, connectionListener);
			connection.addEventListener(AsyncErrorEvent.ASYNC_ERROR, onAsyncError);
			connection.addEventListener(SecurityErrorEvent.SECURITY_ERROR, onSecurityError);
			connection.addEventListener(IOErrorEvent.IO_ERROR, onIOError);
			
			connectToServer();
		}
		
		public function connectToServer():void{
			connection.connect(Requirements.bbb_video_url);
		}
		
		private function onNetStatus(e:NetStatusEvent):void{
			switch(e.info.code){
				case CONNECT_SUCCESS:
					//connectVideo();
					break;
				case CONNECT_FAILED:
					trace("VideoConnector::onNetStatus - connection to Video App failed");
					break;
				case CONNECT_CLOSED:
					trace("VideoConnector::onNetStatus - connection to Video App closed");
					break;
				case CONNECT_REJECTED:
					trace("VideoConnector::onNetStatus - connection to Video App rejected");
					break;
				case NETSTREAM_PUBLISH:
					
					break;
				default:
					trace("VideoConnector::onNetStatus - something else happened: " + e.info.code);
					break;
			}
		}
		
		private function onAsyncError(e:AsyncErrorEvent):void{
			trace("VideoConnector::onAsyncError - an async error occured on the video connection");
		}
		
		private function onSecurityError(e:SecurityErrorEvent):void{
			trace("VideoConnector::onSecurityError - a security error occured on the video connection");
		}
		
		private function onIOError(e:IOErrorEvent):void{
			trace("VideoConnector::onIOError - an IO error occured on the video connection");
		}
		
		public function connectVideo(camera:Camera, streamListener:Function):void{
			outgoingStream = new NetStream(connection);
			outgoingStream.addEventListener(NetStatusEvent.NET_STATUS, onNetStatus);
			outgoingStream.addEventListener(NetStatusEvent.NET_STATUS, streamListener);
			
			streamName = Math.random().toString();
			
			outgoingStream.attachCamera(camera);
			outgoingStream.publish(streamName);
		}
		
		public function changeCamera(camera:Camera):void{
			this.camera = camera;
			outgoingStream.attachCamera(camera);
		}
	}
}
