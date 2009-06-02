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
package org.bigbluebutton.modules.video.model.vo
{
	import flash.events.ActivityEvent;
	import flash.events.StatusEvent;
	import flash.media.Camera;
	import flash.media.Microphone;
	import flash.media.SoundTransform;
	import flash.media.Video;
	
	import org.bigbluebutton.modules.video.model.business.MediaType;
	import org.bigbluebutton.modules.video.model.services.BroadcastStream;
	
	[Bindable]
	public class BroadcastMedia implements IMedia
	{
		private static const _type : MediaType = MediaType.BROADCAST;
		
		public var streamName : String;
		public var uri : String;

		public var deviceStarted : Boolean = false;
		public var broadcasting : Boolean = false;
		
		public var audio : AudioStream;
		public var video : VideoStream;
		public var broadcastMode : BroadcastMode = BroadcastMode.LIVE;
		public var _bStream:BroadcastStream;
		
		public function BroadcastMedia(streamName:String)
		{
			this.streamName = streamName;
			audio = new AudioStream();
			video = new VideoStream();
		}		
		
		public function get type():MediaType
		{
			return _type;
		}
		
		public function set broadcastStream(bStream:BroadcastStream):void {
			_bStream = bStream;
			_bStream.media = this;
		}
		
		public function stopCamera():void {
			_bStream.stopCamera();
		}
		
		public function startCamera():void {
			var selectedCamIndex:int = 	video.settings.cameraIndex;
			var keyFrameInterval:int = 	video.settings.keyframe;
			var cameraWidth:int = 		video.settings.width;
			var cameraHeight:int = 		video.settings.height;
			var cameraFPS:int = 		video.settings.fps;
			var cameraBandwidth:int = 	video.settings.bandwidth;
			var cameraQuality:int = 	video.settings.quality;
			var cameraIndex:String =	String( selectedCamIndex - 1 );
			
			video.cam = Camera.getCamera( cameraIndex );	
			
			var camera:Camera; 		
			camera = video.cam;
			camera.setKeyFrameInterval( keyFrameInterval );
			camera.setMode( cameraWidth, cameraHeight, cameraFPS );
			camera.setQuality( cameraBandwidth, cameraQuality );
			
			camera.addEventListener( ActivityEvent.ACTIVITY, activityEventHandler );
			camera.addEventListener( StatusEvent.STATUS, statusEventHandler );			
			
			// update video stream when publishing			
			_bStream.attachCamera(camera);

			video.localVideo = new Video( 320, 240 );
			video.localVideo.attachCamera( camera );

			deviceStarted = true;		
		}

		public function startMicrophone():void {
			var microphone:Microphone;
			var selectedMicIndex : int = 	audio.settings.micIndex;
			var gain : int = 				audio.settings.gain;
			var rate : int = 				audio.settings.rate;
			var level : int = 				audio.settings.level;
			var timeout : int = 			audio.settings.timeout;
			var micIndex : int = 			selectedMicIndex - 1;
			
			audio.mic = Microphone.getMicrophone( micIndex );
			microphone = audio.mic;			
			microphone.setLoopBack( true );
			
			var transform:SoundTransform = microphone.soundTransform;
			transform.volume = 0;
			
			microphone.setUseEchoSuppression( true );
			microphone.soundTransform = transform;
			microphone.gain = gain;
			microphone.rate = rate;
			microphone.setSilenceLevel( level, timeout );
			
			microphone.addEventListener( ActivityEvent.ACTIVITY, activityEventHandler );
			microphone.addEventListener( StatusEvent.STATUS, statusEventHandler );
			
			// update audio stream when we're already publishing.
			_bStream.attachMicrophone(microphone);
			
			deviceStarted = true;								
		}

		public function stopMicrophone():void {
			// disconnect mic
			if (audio.mic != null ) 
			{
				audio.mic.setLoopBack( false );
				
				_bStream.stopMicrophone();
				deviceStarted = false;
			}				
		}
		
		public function start(publishMode:String, streamName:String):void {
			_bStream.start(publishMode, streamName);
		}
		
		public function stop():void {
			_bStream.stop();
		}
		
		private function activityEventHandler(event:ActivityEvent):void 
		{
		//	log.debug( "StartCameraCommand::activityEventHandler: " + event );
		}
				
		private function statusEventHandler(event:StatusEvent):void 
		{
		//	log.debug( "StartCameraCommand::statusEventHandler: " + event );
		}
	}
}