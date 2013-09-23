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
package org.bigbluebutton.modules.videoconf.model
{
	import org.bigbluebutton.core.BBB;
	
	public class VideoConfOptions
	{
		public var uri:String = "rtmp://localhost/video";
		
		[Bindable]
		public var videoQuality:Number = 100;
		
		[Bindable]
		public var resolutions:String = "320x240,640x480,1280x720";
		
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
		
		[Bindable] public var baseTabIndex:int;
		
		[Bindable]
		public var presenterShareOnly:Boolean = false; 
		
		[Bindable]
		public var controlsForPresenter:Boolean = false; 
		
		[Bindable]
		public var displayAvatar:Boolean = false;
		
		[Bindable]
		public var focusTalking:Boolean = false;
	
    [Bindable]
    public var skipCamSettingsCheck:Boolean = false;
    
		[Bindable]
		public var glowColor:String = "0x4A931D";
		
		[Bindable]
		public var glowBlurSize:Number = 30.0;
		
		public function VideoConfOptions() {
			parseOptions();
		}
		
		public function parseOptions():void {
			var vxml:XML = BBB.getConfigForModule("VideoconfModule");
			if (vxml != null) {
				if (vxml.@uri != undefined) {
					uri = vxml.@uri.toString();
				}		
				if (vxml.@videoQuality != undefined) {
					videoQuality = Number(vxml.@videoQuality.toString());
				}	
				if (vxml.@resolutions != undefined) {
					resolutions = vxml.@resolutions.toString();
				}
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
        if (vxml.@skipCamSettingsCheck != undefined) {
          skipCamSettingsCheck = (vxml.@skipCamSettingsCheck.toString().toUpperCase() == "TRUE") ? true : false;
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
				
				if (vxml.@baseTabIndex != undefined) {
					baseTabIndex = vxml.@baseTabIndex;
				}
				else{
					baseTabIndex = 101;
				}
				
				if (vxml.@displayAvatar != undefined) {
					displayAvatar = (vxml.@displayAvatar.toString().toUpperCase() == "TRUE") ? true : false;
				}
				
				if (vxml.@focusTalking != undefined) {
					focusTalking = (vxml.@focusTalking.toString().toUpperCase() == "TRUE") ? true : false;
				}
				
				if (vxml.@glowColor != undefined) {
					glowColor = vxml.@glowColor.toString();
				}
				
				if (vxml.@glowBlurSize != undefined) {
					glowBlurSize = Number(vxml.@glowBlurSize.toString());
				}
			}
		}
	}
}
