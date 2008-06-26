package org.bigbluebutton.modules.video.view.monitor
{	 
	import com.adobe.cairngorm.control.CairngormEventDispatcher;
	
	import flash.events.*;
	
	import mx.containers.Box;
	import mx.controls.*;
	import mx.events.*;
	
	import org.red5.samples.publisher.control.commands.*;
	import org.red5.samples.publisher.model.*;
	import org.red5.samples.publisher.vo.PlayMedia;
	import org.red5.samples.publisher.vo.PlaybackState;
	
	public class ViewMonitorControlBarClass extends Box
	{				
		[Bindable] public var enableAudio : CheckBox;
		
		[Bindable] public var enableVideo : CheckBox;
		[Bindable] public var media : PlayMedia;
		
		public function viewStream() : void
		{
			if ( media.playState == PlaybackState.PLAYING ) 
			{
				mainApp.publisherApp.pauseStream(media.streamName);					
			} 
			else if ( media.playState == PlaybackState.STOPPED )
			{
				// Start playback from beginning.
				mainApp.publisherApp.playStream(media.streamName, enableVideo.selected, enableAudio.selected );
			} 
			else if ( media.playState == PlaybackState.PAUSED )
			{
				// Resume playback.
				mainApp.publisherApp.resumeStream(media.streamName); 
			}

		}
		
		public function stopStream() : void
		{
			mainApp.publisherApp.stopStream(media.streamName);
		}
				
		/**
         * Enable/disable audio for the playback NetStream.
         */        
        public function toggleAudio() : void
        {
        	// Enable and disable audio.
			mainApp.publisherApp.enableAudio(media.streamName, enableAudio.selected);
        }
        
        /**
         * Enable/disable video for the playback NetStream.
         */        
        public function toggleVideo() : void
        {
        	// Enable and disable audio.
			mainApp.publisherApp.enableVideo(media.streamName, enableVideo.selected);
        }        
	}
}