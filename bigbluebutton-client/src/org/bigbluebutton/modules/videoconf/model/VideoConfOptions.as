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
		public var h264Level:String = "4.1";	
		
		[Bindable]
		public var h264Profile:String = "main";	
		
		[Bindable]
		public var camQualityPicture:Number = 50;	
		
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