package org.bigbluebutton.modules.video.view.settings
{
	import com.adobe.cairngorm.control.CairngormEventDispatcher;
	
	import flash.events.*;
	
	import mx.containers.ViewStack;
	import mx.controls.*;
	import mx.events.*;
	
	import org.red5.samples.publisher.events.*;
	import org.red5.samples.publisher.model.*;
	import org.red5.samples.publisher.vo.ServerPreset;
	
	public class SettingsDisplayClass extends ViewStack
	{	
		private var model : ModelLocator = ModelLocator.getInstance();	
				
		[Bindable] public var main : Main = model.main;
		
		[Bindable] public var navigation : Navigation = model.navigation;
				
		public var audio_btn : Button;		
		public var audio_txt : LinkButton;	
		public var video_btn : Button;	
		public var video_txt : LinkButton;
		public var buffer_ns : NumericStepper;	
		public var type_cb : ComboBox;	
		public var presets_cb : ComboBox;
		public var bw_txt : LinkButton;	
		public var bw_ns : NumericStepper;		
		public var encoding_cb : ComboBox;	
		public var camera_cb : ComboBox;	
		public var fps_ns : NumericStepper;	
		public var fps_txt : LinkButton;
		public var gain_txt : LinkButton;		
		public var gain_ns : NumericStepper;	
		public var width_ns : NumericStepper;		
		public var width_txt : LinkButton;	
		public var height_ns : NumericStepper;
		public var height_txt : LinkButton;
		public var keyframe_ns : NumericStepper;
		public var keyframe_txt : LinkButton;	
		public var level_ns : NumericStepper;	
		public var level_txt : LinkButton;	
		public var microphone_cb : ComboBox;		
		public var quality_ns : NumericStepper;	
		public var quality_txt : LinkButton;	
		public var rate_ns : NumericStepper;			
		public var rate_txt : LinkButton;
		public var proxy_cb : ComboBox;	
		public var timeout_ns : NumericStepper;		
		public var timeout_txt : LinkButton;
		

		public function openLink( path : String ) : void 
		{	
			// Open documentation url.
			var event : OpenDocsEvent = new OpenDocsEvent( path, main.docsURL );
			event.dispatch();
		}
			
		public function setupCamera() : void 
		{
			var selectedCamIndex:Number = camera_cb.selectedIndex;
			var keyframeInterval : Number = main.videoSettings.keyframe;
			var videoWidth : Number = main.videoSettings.width;
			var videoHeight : Number = main.videoSettings.height;
			var fps : Number = main.videoSettings.fps;
			var bandwidth : Number = main.videoSettings.bandwidth;
			var frameQuality : Number = main.videoSettings.quality;
			// No video.
			if ( selectedCamIndex == 0 ) 
			{
				// stop camera
				var stopCameraEvent : StopCameraEvent = new StopCameraEvent();
				stopCameraEvent.dispatch();
			} 
			else if ( selectedCamIndex > -1 )
			{				
				video_btn.label = "Apply";
				// start camera
				var startCameraEvent : StartCameraEvent 
						= new StartCameraEvent( selectedCamIndex,
												keyframeInterval,
												videoWidth,
												videoHeight,
												fps,
												bandwidth,
												frameQuality );
				startCameraEvent.dispatch();
			}
		}
		
		public function setupMicrophone() : void 
		{
			var selectedMicIndex : Number = microphone_cb.selectedIndex;
			var gain : Number = main.audioSettings.gain;
			var bitrate : Number = main.audioSettings.rate;
			var silenceLevel : Number = main.audioSettings.level;
			var silenceTimeout : Number = main.audioSettings.timeout;
			// No audio.
			if ( selectedMicIndex == 0 ) 
			{
				// stop microphone
				var stopMicrophoneEvent : StopMicrophoneEvent = new StopMicrophoneEvent();
				stopMicrophoneEvent.dispatch();
			} 
			else if ( selectedMicIndex > -1 )
			{
				//
				audio_btn.label = "Apply";
				// start microphone
				var startMicrophoneEvent : StartMicrophoneEvent 
						= new StartMicrophoneEvent( selectedMicIndex,
													gain,
													bitrate,
													silenceLevel,
													silenceTimeout );
				startMicrophoneEvent.dispatch();
			}
		}		
	}
}