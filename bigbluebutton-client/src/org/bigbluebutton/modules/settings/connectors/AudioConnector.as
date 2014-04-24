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
	import flash.media.Microphone;
	import flash.media.SoundCodec;
	import flash.net.NetConnection;
	import flash.net.NetStream;
	
	import mx.controls.Alert;
	
	import org.bigbluebutton.modules.settings.util.Requirements;
		
	public class AudioConnector
	{
		public static const CONNECT_SUCCESS:String = "NetConnection.Connect.Success";
		public static const CONNECT_FAILED:String = "NetConnection.Connect.Failed";
		public static const CONNECT_CLOSED:String = "NetConnection.Connect.Closed";
		public static const INVALID_APP:String = "NetConnection.Connect.InvalidApp";
		public static const APP_SHUTDOWN:String = "NetConnection.Connect.AppShutDown";
		public static const CONNECT_REJECTED:String = "NetConnection.Connect.Rejected";
				
		private var audioCodec:String = "SPEEX";
		
		private var connection:NetConnection;
		private var outgoingStream:NetStream;
		private var incomingStream:NetStream;
		
		private var streamName:String;
		
		private var mic:Microphone;
		
		public function AudioConnector(mic:Microphone)
		{
			this.mic = mic;
			
			connection = new NetConnection();
			connection.proxyType = "best";
			connection.client = this;
			connection.addEventListener(NetStatusEvent.NET_STATUS, onNetStatus);
			connection.addEventListener(AsyncErrorEvent.ASYNC_ERROR, onAsyncError);
			connection.addEventListener(SecurityErrorEvent.SECURITY_ERROR, onSecurityError);
			connection.addEventListener(IOErrorEvent.IO_ERROR, onIOError);
			connection.connect(Requirements.bbb_voice_url);
		}
		
		private function onNetStatus(e:NetStatusEvent):void{
			switch(e.info.code){
				case CONNECT_SUCCESS:
					connectAudio();
					break;
				case CONNECT_FAILED:
					trace("AudioConnector::onNetStatus - connection to Audio App failed");
					break;
				case CONNECT_CLOSED:
					trace("AudioConnector::onNetStatus - connection to Audio App closed");
					break;
				case CONNECT_REJECTED:
					trace("AudioConnector::onNetStatus - connection to Audio App rejected");
					break;
				default:
					trace("AudioConnector::onNetStatus - something else happened: " + e.info.code);
					break;
			}
		}
		
		private function onAsyncError(e:AsyncErrorEvent):void{
			trace("AudioConnector::onAsyncError - an async error occured on the audio connection");
		}
		
		private function onSecurityError(e:SecurityErrorEvent):void{
			trace("AudioConnector::onSecurityError - a security error occured on the audio connection");
		}
		
		private function onIOError(e:IOErrorEvent):void{
			trace("AudioConnector::onIOError - an IO error occured on the audio connection");
		}
		
		private function connectAudio():void{
			outgoingStream = new NetStream(connection);
			outgoingStream.addEventListener(NetStatusEvent.NET_STATUS, onNetStatus);
			
			streamName = Math.random().toString();
			
			setupMicrophone();
			outgoingStream.attachAudio(mic);
			outgoingStream.publish(streamName, "live");
		}
		
		public function changeMic(mic:Microphone):void{
			this.mic = mic;
			setupMicrophone();
			outgoingStream.attachAudio(mic);
		}
		
		private function setupMicrophone():void {
			mic.setUseEchoSuppression(true);
			//TODO Set loopBack to false once this is connected to the Asterisk/Freeswitch echo application
			mic.setLoopBack(true);
			mic.setSilenceLevel(0,20000);
			if (audioCodec == "SPEEX") {
				mic.encodeQuality = 6;
				mic.codec = SoundCodec.SPEEX;
				mic.framesPerPacket = 1;
				mic.rate = 16; 
			} else {
				mic.codec = SoundCodec.NELLYMOSER;
				mic.rate = 8;
			}			
			mic.gain = 60;			
		}
		
		public function stop():void{
			if (mic != null){
				mic.setLoopBack(false);
				mic = null;
			}
			if (outgoingStream != null) outgoingStream.close();
			if (incomingStream != null) incomingStream.close();
		}
	}
}
