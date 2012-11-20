package org.bigbluebutton.modules.videoconf.model
{
	import org.bigbluebutton.core.BBB;
	
	public class VideoConfOptions
	{
		[Bindable]
		public var autoStart:Boolean = false;
		
		[Bindable]
		public var showCloseButton:Boolean = true;
		
		[Bindable]
		public var showButton:Boolean = true;
		
		[Bindable]
		public var publishWindowVisible:Boolean = true;
		
		[Bindable]
		public var viewerWindowMaxed:Boolean = false;

		[Bindable]
		public var viewerWindowLocation:String = "middle";

		[Bindable]
		public var camKeyFrameInterval:Number = 5;
		
		[Bindable]
		public var camModeFps:Number = 15;
		
		[Bindable]
		public var camQualityBandwidth:Number = 0;

		[Bindable]
		public var smoothVideo:Boolean = false;

		[Bindable]
		public var applyConvolutionFilter:Boolean = false;

		[Bindable]
		public var convolutionFilter:Array = [-1, 0, -1, 0, 6, 0, -1, 0, -1];

		[Bindable]
		public var filterBias:Number = 0;

		[Bindable]
		public var filterDivisor:Number = 4;

		[Bindable]
		public var enableH264:Boolean = false;

		[Bindable]
		public var h264Level:String = "2.1";	
		
		[Bindable]
		public var h264Profile:String = "main";	
		
		[Bindable]
		public var camQualityPicture:Number = 50;	
		
    [Bindable]
    public var presenterShareOnly:Boolean = false; 

    [Bindable]
    public var controlsForPresenter:Boolean = false; 
    
    public function VideoConfOptions() {
      parseOptions();
    }
    
		public function parseOptions():void {
			var vxml:XML = BBB.getConfigForModule("VideoconfModule");
			if (vxml != null) {
				if (vxml.@showCloseButton != undefined) {
					showCloseButton = (vxml.@showCloseButton.toString().toUpperCase() == "TRUE") ? true : false;
				}
				if (vxml.@showButton != undefined) {
					showButton = (vxml.@showButton.toString().toUpperCase() == "TRUE") ? true : false;
				}
				if (vxml.@autoStart != undefined) {
					autoStart = (vxml.@autoStart.toString().toUpperCase() == "TRUE") ? true : false;
				}
				if (vxml.@publishWindowVisible != undefined) {
					publishWindowVisible = (vxml.@publishWindowVisible.toString().toUpperCase() == "TRUE") ? true : false;
				}		       
        if (vxml.@presenterShareOnly != undefined) {
          presenterShareOnly = (vxml.@presenterShareOnly.toString().toUpperCase() == "TRUE") ? true : false;
        }
        if (vxml.@controlsForPresenter != undefined) {
          controlsForPresenter = (vxml.@controlsForPresenter.toString().toUpperCase() == "TRUE") ? true : false;
        }	
				if (vxml.@viewerWindowMaxed != undefined) {
					viewerWindowMaxed = (vxml.@viewerWindowMaxed.toString().toUpperCase() == "TRUE") ? true : false;
				}					
				if (vxml.@viewerWindowLocation != undefined) {
					viewerWindowLocation = vxml.@viewerWindowLocation.toString().toUpperCase();
				}				
				if (vxml.@viewerWindowLocation != undefined) {
					viewerWindowLocation = vxml.@viewerWindowLocation.toString().toUpperCase();
				}	
				if (vxml.@camKeyFrameInterval != undefined) {
					camKeyFrameInterval = Number(vxml.@camKeyFrameInterval.toString());
				}	
				if (vxml.@camModeFps != undefined) {
					camModeFps = Number(vxml.@camModeFps.toString());
				}				
				if (vxml.@camQualityBandwidth != undefined) {
					camQualityBandwidth = Number(vxml.@camQualityBandwidth.toString());
				}				
				if (vxml.@camQualityPicture != undefined) {
					camQualityPicture = Number(vxml.@camQualityPicture.toString());
				}
				if (vxml.@smoothVideo != undefined) {
					smoothVideo = (vxml.@smoothVideo.toString().toUpperCase() == "TRUE") ? true : false;
				}
				if (vxml.@applyConvolutionFilter != undefined) {
					applyConvolutionFilter = (vxml.@applyConvolutionFilter.toString().toUpperCase() == "TRUE") ? true : false;
				}
				if (vxml.@convolutionFilter != undefined) {
					var f:Array = vxml.@convolutionFilter.split(",");
					var fint:Array = new Array();
					for (var i:int=0; i < f.length; i++) {
						convolutionFilter[i] = Number(f[i]);
					}
				}
				if (vxml.@filterBias != undefined) {
					filterBias = Number(vxml.@filterBias.toString());
				}	
				if (vxml.@filterDivisor != undefined) {
					filterDivisor = Number(vxml.@filterDivisor.toString());
				}	
				if (vxml.@enableH264 != undefined) {
					enableH264 = (vxml.@enableH264.toString().toUpperCase() == "TRUE") ? true : false;
				}	
				if (vxml.@h264Level != undefined) {
					h264Level = vxml.@h264Level.toString();
				}
				if (vxml.@h264Profile != undefined) {
					h264Profile = vxml.@h264Profile.toString();
				}
			}
		}
	}
}
